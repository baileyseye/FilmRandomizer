package org.baileyseye.actions;

import java.util.List;

public record UserData(
        String label,
        List<String> films,
        List<String> watchedFilms,
        String filmsFile,
        String watchedFilmsFile) {
}
