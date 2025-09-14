package org.example.emt_project.service.domain.impl;

import java.io.*;
import java.util.*;
import java.util.zip.*;

public final class InMemoryZip {

    private static final class EntryData {
        final boolean directory;
        final byte[] bytes; // null for directories
        EntryData(boolean directory, byte[] bytes) { this.directory = directory; this.bytes = bytes; }
    }

    /** Add arbitrary bytes as a single entry inside baseZip at destPath (e.g., "uploads/new.zip"). */
    public static byte[] addEntry(byte[] baseZip, String destPath, byte[] content, boolean overwrite) throws IOException {
        LinkedHashMap<String, EntryData> map = readZipToMap(baseZip);
        String name = normalize(destPath);

        // ensure parent dirs exist inside the ZIP
        addParentDirs(map, name);

        if (overwrite || !map.containsKey(name)) {
            map.put(name, new EntryData(false, content == null ? new byte[0] : content));
        }
        return writeMapToZip(map);
    }

    /** Specialization: add a second ZIP as a nested .zip file inside baseZip (no flattening). */
    public static byte[] addZipAsNested(byte[] baseZip, byte[] nestedZip, String nestedZipPath, boolean overwrite) throws IOException {
        return addEntry(baseZip, nestedZipPath, nestedZip, overwrite);
    }

    /** Optional: Flatten/merge contents of addZip into baseZip (under an optional prefix). */
    public static byte[] mergeZipUnderPrefix(byte[] baseZip, byte[] addZip, String prefix, boolean overwrite) throws IOException {
        LinkedHashMap<String, EntryData> map = readZipToMap(baseZip);
        String pfx = normalizePrefix(prefix);

        try (ZipInputStream zin = new ZipInputStream(new ByteArrayInputStream(orEmpty(addZip)))) {
            ZipEntry e;
            while ((e = zin.getNextEntry()) != null) {
                String name = normalize(pfx + e.getName());
                if (e.isDirectory()) {
                    ensureDir(map, name);
                } else {
                    byte[] data = readAll(zin);
                    putFile(map, name, data, overwrite);
                }
                zin.closeEntry();
            }
        }
        return writeMapToZip(map);
    }

    /* ---------------- internals ---------------- */

    private static LinkedHashMap<String, EntryData> readZipToMap(byte[] zip) throws IOException {
        LinkedHashMap<String, EntryData> map = new LinkedHashMap<>();
        if (zip == null || zip.length == 0) return map; // start empty
        try (ZipInputStream zin = new ZipInputStream(new ByteArrayInputStream(zip))) {
            ZipEntry e;
            while ((e = zin.getNextEntry()) != null) {
                String name = normalize(e.getName());
                if (e.isDirectory()) {
                    ensureDir(map, name);
                } else {
                    byte[] data = readAll(zin);
                    putFile(map, name, data, true); // base entries kept
                }
                zin.closeEntry();
            }
        }
        return map;
    }

    private static void ensureDir(Map<String, EntryData> map, String dirName) {
        String dn = dirName.endsWith("/") ? dirName : dirName + "/";
        addParentDirs(map, dn);
        map.putIfAbsent(dn, new EntryData(true, null));
    }

    private static void addParentDirs(Map<String, EntryData> map, String path) {
        String[] parts = normalize(path).split("/");
        StringBuilder cur = new StringBuilder();
        for (int i = 0; i < parts.length - 1; i++) {
            if (parts[i].isEmpty()) continue;
            if (cur.length() > 0 && cur.charAt(cur.length() - 1) != '/') cur.append('/');
            cur.append(parts[i]).append('/');
            map.putIfAbsent(cur.toString(), new EntryData(true, null));
        }
    }

    private static void putFile(Map<String, EntryData> map, String name, byte[] data, boolean overwrite) {
        addParentDirs(map, name);
        if (overwrite || !map.containsKey(name)) {
            map.put(name, new EntryData(false, data));
        }
    }

    private static byte[] writeMapToZip(LinkedHashMap<String, EntryData> entries) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            // directories first (shallow → deep)
            entries.entrySet().stream()
                    .filter(e -> e.getValue().directory)
                    .sorted(Comparator.comparingInt(e -> depth(e.getKey())))
                    .forEach(e -> writeEntry(zos, ensureSlash(e.getKey()), null, true));

            // then files
            for (Map.Entry<String, EntryData> e : entries.entrySet()) {
                if (!e.getValue().directory) {
                    writeEntry(zos, e.getKey(), e.getValue().bytes, false);
                }
            }
            zos.finish();
        }
        return baos.toByteArray();
    }

    private static void writeEntry(ZipOutputStream zos, String name, byte[] data, boolean dir) {
        try {
            ZipEntry ze = new ZipEntry(name);
            zos.putNextEntry(ze);
            if (!dir && data != null && data.length > 0) {
                zos.write(data);
            }
            zos.closeEntry();
        } catch (IOException ex) {
            throw new UncheckedIOException(ex);
        }
    }

    private static String normalize(String p) {
        if (p == null) return "";
        String n = p.replace("\\", "/");
        while (n.contains("//")) n = n.replace("//", "/");
        if (n.startsWith("./")) n = n.substring(2);
        if (n.startsWith("/")) n = n.substring(1);
        return n;
    }
    private static String normalizePrefix(String p) {
        String n = normalize(p);
        if (n.isEmpty()) return "";
        return n.endsWith("/") ? n : n + "/";
    }
    private static String ensureSlash(String s) { return s.endsWith("/") ? s : s + "/"; }
    private static int depth(String p) { return (int) Arrays.stream(p.split("/")).filter(s -> !s.isEmpty()).count(); }
    private static byte[] readAll(InputStream in) throws IOException { ByteArrayOutputStream b = new ByteArrayOutputStream(); in.transferTo(b); return b.toByteArray(); }
    private static byte[] orEmpty(byte[] a) { return a == null ? new byte[0] : a; }

    private InMemoryZip() {}
}

