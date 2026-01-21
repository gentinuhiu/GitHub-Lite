package org.example.emt_project;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.emt_project.model.domain.User;
import org.example.emt_project.repository.UserRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import java.io.ByteArrayOutputStream;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class RepositoryIntegrationTests {

    private static final String BASE = "/api/repositories";
    private static final String AUTH_REGISTER = "/api/auth/register";

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @Autowired UserRepository userRepository;

    private User owner;
    private User otherUser;

    @BeforeEach
    void setupUsers() throws Exception {
        String u1 = "owner" + System.currentTimeMillis();
        String u2 = "other" + (System.currentTimeMillis() + 1);

        registerUser(u1, "Password123!", u1 + "@test.com");
        registerUser(u2, "Password123!", u2 + "@test.com");

        owner = userRepository.findByUsername(u1).orElseThrow();
        otherUser = userRepository.findByUsername(u2).orElseThrow();
    }

    private void registerUser(String username, String password, String email) throws Exception {
        var body = new CreateUserDto("Name", username, password, password, email);
        mockMvc.perform(post(AUTH_REGISTER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());
    }

    private void authAs(User user) {
        var auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private Long createRepoAs(User user, String name, boolean isPublic) throws Exception {
        authAs(user);
        var body = new CreateRepositoryDto(name, "desc", isPublic);

        String json = mockMvc.perform(post(BASE + "/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is(name)))
                .andReturn()
                .getResponse()
                .getContentAsString();

        // Expect response contains id
        return objectMapper.readTree(json).get("id").asLong();
    }

    @AfterEach
    void clearAuth() {
        SecurityContextHolder.clearContext();
    }

    // -------------------------
    // FIND ALL
    // -------------------------
    @Test
    void findAll_shouldReturnList() throws Exception {
        createRepoAs(owner, "RepoA", true);
        createRepoAs(owner, "RepoB", false);

        mockMvc.perform(get(BASE))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", is(notNullValue())))
                .andExpect(jsonPath("$", isA(java.util.List.class)));
    }

    // -------------------------
    // GET ALL FOR USER (owner sees all; others see public only)
    // -------------------------
    @Test
    void getAllForUser_ownerSeesAll_otherSeesOnlyPublic() throws Exception {
        createRepoAs(owner, "PublicRepo", true);
        createRepoAs(owner, "PrivateRepo", false);

        // owner request: should return both
        authAs(owner);
        mockMvc.perform(get(BASE + "/" + owner.getUsername()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].name", hasItems("PublicRepo", "PrivateRepo")));

        // other user request: should return only public
        authAs(otherUser);
        mockMvc.perform(get(BASE + "/" + owner.getUsername()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].name", hasItem("PublicRepo")))
                .andExpect(jsonPath("$[*].name", not(hasItem("PrivateRepo"))));
    }

    // -------------------------
    // DETAILS
    // -------------------------
    @Test
    void findById_existing_shouldReturn200_notFoundShouldReturn404() throws Exception {
        Long id = createRepoAs(owner, "RepoDetails", true);

        mockMvc.perform(get(BASE + "/details/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(id.intValue())))
                .andExpect(jsonPath("$.name", is("RepoDetails")));

        mockMvc.perform(get(BASE + "/details/999999999"))
                .andExpect(status().isNotFound());
    }

    // -------------------------
    // FILTER BY NAME
    // -------------------------
    @Test
    void filterByName_shouldReturnMatchingRepos() throws Exception {
        createRepoAs(owner, "MyCoolRepo", true);
        createRepoAs(owner, "AnotherOne", true);

        mockMvc.perform(get(BASE + "/filter-by-name/cool"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].name", hasItem("MyCoolRepo")))
                .andExpect(jsonPath("$[*].name", not(hasItem("AnotherOne"))));
    }

    // -------------------------
    // EDIT
    // -------------------------
    @Test
    void edit_existing_shouldUpdate_andReturn200() throws Exception {
        Long id = createRepoAs(owner, "RepoToEdit", true);

        authAs(owner);
        var editDto = new CreateRepositoryDto("RepoEdited", "new desc", false);

        mockMvc.perform(post(BASE + "/edit/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(editDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("RepoEdited")))
                .andExpect(jsonPath("$.isPublic", is(false)));
    }

    @Test
    void edit_nonExisting_shouldReturn404() throws Exception {
        authAs(owner);
        var editDto = new CreateRepositoryDto("RepoEdited", "new desc", true);

        mockMvc.perform(post(BASE + "/edit/9999999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(editDto)))
                .andExpect(status().isNotFound());
    }

    // -------------------------
    // DELETE
    // -------------------------
    @Test
    void delete_existing_shouldReturn200_thenDetailsShould404() throws Exception {
        Long id = createRepoAs(owner, "RepoToDelete", true);

        mockMvc.perform(delete(BASE + "/delete/" + id))
                .andExpect(status().isOk());

        mockMvc.perform(get(BASE + "/details/" + id))
                .andExpect(status().isNotFound());
    }

    // -------------------------
    // UPLOAD REPO ZIP
    // -------------------------
    @Test
    void uploadRepository_zip_shouldReturn200() throws Exception {
        authAs(owner);

        byte[] zip = createSimpleZipBytes("hello.txt", "Hello World");
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "repo.zip",
                "application/zip",
                zip
        );

        mockMvc.perform(multipart(BASE + "/upload")
                        .file(file)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", notNullValue()));
    }

    @Test
    void uploadRepository_wrongFile_shouldReturn400() throws Exception {
        authAs(owner);

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "not-a-zip.txt",
                "text/plain",
                "nope".getBytes(StandardCharsets.UTF_8)
        );

        mockMvc.perform(multipart(BASE + "/upload")
                        .file(file)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isBadRequest());
    }

    // -------------------------
    // DOWNLOAD ZIP
    // -------------------------
    @Test
    void downloadRepository_shouldReturnZipAttachment() throws Exception {
        authAs(owner);

        byte[] zip = createSimpleZipBytes("a.txt", "abc");
        MockMultipartFile file = new MockMultipartFile("file", "repo.zip", "application/zip", zip);

        String json = mockMvc.perform(multipart(BASE + "/upload")
                        .file(file)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        Long id = objectMapper.readTree(json).get("id").asLong();

        mockMvc.perform(get(BASE + "/download/" + id))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", containsString("application/zip")))
                .andExpect(header().string("Content-Disposition", containsString("attachment; filename=")))
                .andExpect(result -> {
                    long len = result.getResponse().getContentAsByteArray().length;
                    Assertions.assertTrue(len > 0, "Downloaded zip should not be empty");
                });
    }

    // -------------------------
    // COLLABORATORS / COMMITS (smoke tests)
    // -------------------------
    @Test
    void collaboratorsAndCommits_shouldReturn200List() throws Exception {
        Long id = createRepoAs(owner, "RepoForLists", true);

        mockMvc.perform(get(BASE + "/collaborators/" + id))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));

        mockMvc.perform(get(BASE + "/commits/" + id))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    // -------------------------
    // IDENTIFY (smoke)
    // -------------------------
    @Test
    void identify_shouldReturn200UserDto() throws Exception {
        Long id = createRepoAs(owner, "RepoIdentify", true);

        authAs(owner);
        mockMvc.perform(get(BASE + "/identify/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username", is(owner.getUsername())));
    }

    // -------------------------
    // add / remove collaborator (smoke)
    // -------------------------
    @Test
    void addAndRemoveCollaborator_shouldReturn200() throws Exception {
        Long repoId = createRepoAs(owner, "RepoCollab", true);

        authAs(owner);

        var payload = new PayloadDto(otherUser.getUsername());

        mockMvc.perform(post(BASE + "/add-collaborator/" + repoId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk());

        mockMvc.perform(delete(BASE + "/remove-collaborator/" + repoId)
                        .param("username", otherUser.getUsername()))
                .andExpect(status().isOk());
    }

    // -------------------------
    // upload-dir / delete-dir / delete-file (smoke)
    // -------------------------
    @Test
    void uploadDir_deleteDir_deleteFile_shouldReturn200() throws Exception {
        Long repoId = createRepoAs(owner, "RepoDir", true);
        authAs(owner);

        byte[] zip = createSimpleZipBytes("folder/file.txt", "hi");
        MockMultipartFile archive = new MockMultipartFile("archive", "dir.zip", "application/zip", zip);

        mockMvc.perform(multipart(BASE + "/upload-dir/" + repoId)
                        .file(archive)
                        .param("path", "")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk());

        mockMvc.perform(delete(BASE + "/delete-file/" + repoId)
                        .param("path", "folder/file.txt"))
                .andExpect(status().isOk());

        mockMvc.perform(delete(BASE + "/delete-dir/" + repoId)
                        .param("path", "folder"))
                .andExpect(status().isOk());
    }

    // -------------------------
    // Helpers
    // -------------------------
    private byte[] createSimpleZipBytes(String entryName, String content) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            zos.putNextEntry(new ZipEntry(entryName));
            zos.write(content.getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();
        }
        return baos.toByteArray();
    }

    record CreateUserDto(String name, String username, String password, String repeatPassword, String email) {}
    record CreateRepositoryDto(String name, String description, boolean isPublic) {}
    record PayloadDto(String data) {}
}
