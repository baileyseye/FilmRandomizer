package org.baileyseye;

import static lombok.AccessLevel.PRIVATE;

import java.util.List;
import lombok.NoArgsConstructor;
import org.baileyseye.actions.FileLoader;
import org.baileyseye.actions.FilmSelector;
import org.baileyseye.actions.UserData;
import org.baileyseye.actions.WatchedFilmsPrinter;
import org.baileyseye.user.ConsoleUserInteraction;

@NoArgsConstructor(access = PRIVATE)
public final class FilmRandomizer {

    private static final String USER1_FILMS_FILE = "data/user1_films.txt";
    private static final String USER2_FILMS_FILE = "data/user2_films.txt";
    private static final String USER1_WATCHED_FILMS_FILE = "data/user1_watched_films.txt";
    private static final String USER2_WATCHED_FILMS_FILE = "data/user2_watched_films.txt";

    public static void main(String[] args) {
        UserData user1 = userData("Пользователь 1", USER1_FILMS_FILE, USER1_WATCHED_FILMS_FILE);
        UserData user2 = userData("Пользователь 2", USER2_FILMS_FILE, USER2_WATCHED_FILMS_FILE);

        try (ConsoleUserInteraction consoleInteraction = new ConsoleUserInteraction()) {
            new FilmSelector(consoleInteraction).selectAndPrintRandomFilm(user1, user2);
            WatchedFilmsPrinter.printWatchedFilms(consoleInteraction, user1, user2);
        }
    }

    private static UserData userData(String label, String filmsFile, String watchedFilmsFile) {
        List<String> films = FileLoader.loadListFromFile(filmsFile);
        List<String> watchedFilms = FileLoader.loadListFromFile(watchedFilmsFile);

        return new UserData(label, films, watchedFilms, filmsFile, watchedFilmsFile);
    }
}
