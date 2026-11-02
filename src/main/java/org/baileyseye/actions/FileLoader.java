package org.baileyseye.actions;

import static java.util.Collections.emptyList;
import static lombok.AccessLevel.PRIVATE;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@NoArgsConstructor(access = PRIVATE)
public final class FileLoader {

    public static List<String> loadListFromFile(String filename) {
        try {
            List<String> lines = Files.readAllLines(Path.of(filename), StandardCharsets.UTF_8);
            List<String> items = new ArrayList<>(lines.size());

            for (String line : lines) {
                String item = line.strip();
                if (!item.isEmpty()) {
                    items.add(item);
                }
            }

            return items;
        } catch (IOException e) {
            log.error("Unable to load list from file: {}", filename, e);
            return emptyList();
        }
    }
}
