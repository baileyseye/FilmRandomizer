package org.baileyseye;

import java.util.List;

public class FilmRandomizer {

    private static List<String> user1Films;
    private static List<String> user2Films;
    private static List<String> user1WatchedFilms;
    private static List<String> user2WatchedFilms;
    private static final String USER1_FILMS_FILE = "data/user1_films.txt";
    private static final String USER2_FILMS_FILE = "data/user2_films.txt";
    private static final String USER1_WATCHED_FILMS_FILE = "data/user1_watched_films.txt";
    private static final String USER2_WATCHED_FILMS_FILE = "data/user2_watched_films.txt";

    public static void main(String[] args) {
        FilmRandomizer filmRandomizer = new FilmRandomizer();
        UserInteraction consoleInteraction = new ConsoleUserInteraction();
        FilmSelector filmSelector = new FilmSelector(consoleInteraction);
        filmSelector.selectAndPrintRandomFilm(
                user1Films,
                user2Films,
                user1WatchedFilms,
                user2WatchedFilms,
                "data/user1_films.txt",
                "data/user2_films.txt",
                "data/user1_watched_films.txt",
                "data/user2_watched_films.txt");

        filmRandomizer.printWatchedFilms();
    }

    public FilmRandomizer() {
        user1Films = FileLoader.loadListFromFile(USER1_FILMS_FILE);
        user2Films = FileLoader.loadListFromFile(USER2_FILMS_FILE);
        user1WatchedFilms = FileLoader.loadListFromFile(USER1_WATCHED_FILMS_FILE);
        user2WatchedFilms = FileLoader.loadListFromFile(USER2_WATCHED_FILMS_FILE);
    }

    public void printWatchedFilms() {
        WatchedFilmsPrinter.printWatchedFilms(user1WatchedFilms, user2WatchedFilms);
    }
}

