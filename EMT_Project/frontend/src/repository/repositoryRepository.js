import axiosInstance from "../axios/axios.js";

const repositoryRepository = {
    getAllForUser: async (data) => {
        return axiosInstance.get(`/repositories/${encodeURIComponent(data)}`);
    },
    getRepository: async (id) => {
        return axiosInstance.get(`/repositories/details/${encodeURIComponent(id)}`);
    },

    create: async (dto) => {
        return axiosInstance.post(`/repositories/add`, dto);
    },

    uploadZip: async (file) => {
        const formData = new FormData();
        formData.append("file", file, file.name); // <-- 'file' must match @RequestParam("file")
        return axiosInstance.post(`/repositories/upload`, formData); // no explicit headers
    },

    getCollaborators: async (repoId) => {
        return axiosInstance.get(`/repositories/collaborators/${encodeURIComponent(repoId)}`);
    },

    getCommits: async (repoId) => {
        return axiosInstance.get(`/repositories/commits/${encodeURIComponent(repoId)}`);
    },

    getStructure: async (repoId) => {
        return axiosInstance.get(`/code-files/structure/${encodeURIComponent(repoId)}`);
    },

    // file content (expects text; if your API returns blob, adjust responseType)
    getFile: async (repoId, path) => {
        return axiosInstance.get(
            `/code-files/file/${encodeURIComponent(repoId)}`,
            {params: {path}} // ?path=dir1/dir2/file.txt
        );
    },

    // optional helper to open raw in a new tab (uses the same endpoint with responseType=blob)
    openRawInNewTab: async (repoId, path) => {
        const res = await axiosInstance.get(
            `/code-files/file/${encodeURIComponent(repoId)}`,
            { params: { path }, responseType: "blob" }
        );
        const url = URL.createObjectURL(res.data);
        window.open(url, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
    },


    downloadFile: async (repoId, path) => {
        return axiosInstance.get(
            `/code-files/download/${encodeURIComponent(repoId)}`,
            {params: {path}, responseType: "blob" }
        );
    },

    deleteRepository: async (id) => {
      return axiosInstance.delete(`/repositories/delete/${encodeURIComponent(id)}`);
    },

    downloadRepositoryZip: async (id) => {
        return axiosInstance.get(`/repositories/download/${encodeURIComponent(id)}`,
            { responseType: "blob" });
    },
    identify: async (id) => {
        return axiosInstance.get(`/repositories/identify/${encodeURIComponent(id)}`);
    },
    updateRepository: async (id, body) => {
        return axiosInstance.post(`/repositories/edit/${encodeURIComponent(id)}`, body)
    },
    uploadFile: async (repoId, path, file) => {
        const fd = new FormData();
        fd.append("file", file, file.name); // MUST be 'file'
        fd.append("path", path || "");      // current directory ("" = root)

        return axiosInstance.post(
            `/code-files/upload/${encodeURIComponent(repoId)}`,
            fd
            // no manual Content-Type; let Axios set the boundary
        );
    },

// repositoryRepository.js
    uploadZipDirectory: async (repoId, path, zipFile) => {
        const form = new FormData();
        form.append("archive", zipFile);
        form.append("path", path || "");
        return axiosInstance.post(`/repositories/upload-dir/${repoId}`, form, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    deleteDirectory: async (id, path) => {
      return axiosInstance.delete(`/repositories/delete-dir/${encodeURIComponent(id)}`, { params: {path}});
    },

    deleteFile: async (id, path) => {
        return axiosInstance.delete(`/repositories/delete-file/${encodeURIComponent(id)}`,
            { params: {path}});
    },
    searchUsers: async (repoId, username) => {
        return axiosInstance.get(`/user/search`, {
            params: { username }
        });
    },

    addCollaborator: async (repoId, username) => {
        return axiosInstance.post(
            `/repositories/add-collaborator/${encodeURIComponent(repoId)}`,
            { username }
        );
    },

    searchGlobal: async (query) => {
        return axiosInstance.get(`/search`, { params: { q: query } });
    },

    searchEntityById: async (id, type) => {
        return axiosInstance.post(`/search/entity/${encodeURIComponent(id)}`, { type });
    },

    // repositoryRepository.js
    removeCollaborator: async (repoId, username) => {
        return axiosInstance.delete(
            `/repositories/remove-collaborator/${encodeURIComponent(repoId)}`,
            { params: { username } }
        );
    }

};

export default repositoryRepository;