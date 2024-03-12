package org.baileyseye;

import java.util.List;
import java.util.Random;
import java.util.Scanner;

public class FilmSelector {
    public static void selectAndPrintRandomFilm
            (
                    List<String> user1Films,
             List<String> user2Films,
             List<String> user1WatchedFilms,
             List<String> user2WatchedFilms,
             String user1FilmsFile, String user2FilmsFile,
             String user1WatchedFilmsFile,
             String user2WatchedFilmsFile
            ) {
        Scanner scanner = new Scanner(System.in);

        System.out.println("Which user do you choose? (Enter 1 or 2)");
        int userChoice = scanner.nextInt();
        scanner.nextLine();

        List<String> selectedUserFilms;
        List<String> selectedUserWatchedFilms;
        String filmsFile;
        String watchedFilmsFile;

        switch (userChoice) {
            case 1:
                selectedUserFilms = user1Films;
                selectedUserWatchedFilms = user1WatchedFilms;
                filmsFile = user1FilmsFile;
                watchedFilmsFile = user1WatchedFilmsFile;
                break;
            case 2:
                selectedUserFilms = user2Films;
                selectedUserWatchedFilms = user2WatchedFilms;
                filmsFile = user2FilmsFile;
                watchedFilmsFile = user2WatchedFilmsFile;
                break;
            default:
                throw new IllegalArgumentException("Invalid user choice: " + userChoice);
        }

        if (selectedUserFilms.isEmpty()) {
            System.out.println("The movie list is empty for the selected user.");
            return;
        }

        Random random = new Random();
        int index = random.nextInt(selectedUserFilms.size());

        String randomFilm = selectedUserFilms.get(index);
        System.out.println("Random movie: " + randomFilm);

        selectedUserFilms.remove(index);
        selectedUserWatchedFilms.add(randomFilm);
        FilmRandomizer.saveListToFile(selectedUserFilms, filmsFile);
        FilmRandomizer.saveListToFile(selectedUserWatchedFilms, watchedFilmsFile);
    }
}
