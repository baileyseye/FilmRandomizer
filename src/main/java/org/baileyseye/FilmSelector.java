package org.baileyseye;

import java.util.List;
import java.util.Random;

public class FilmSelector {

    private final UserInteraction userInteraction;

    public FilmSelector(UserInteraction userInteraction) {
        this.userInteraction = userInteraction;
    }

    public  void selectAndPrintRandomFilm
            (
                    List<String> user1Films,
                    List<String> user2Films,
                    List<String> user1WatchedFilms,
                    List<String> user2WatchedFilms,
                    String user1FilmsFile, String user2FilmsFile,
                    String user1WatchedFilmsFile,
                    String user2WatchedFilmsFile
            ) {
        UserChoice userChoice = userInteraction.getUserChoice();

        List<String> selectedUserFilms;
        List<String> selectedUserWatchedFilms;
        String filmsFile;
        String watchedFilmsFile;

        switch (userChoice) {
            case USER1:
                selectedUserFilms = user1Films;
                selectedUserWatchedFilms = user1WatchedFilms;
                filmsFile = user1FilmsFile;
                watchedFilmsFile = user1WatchedFilmsFile;
                break;
            case USER2:
                selectedUserFilms = user2Films;
                selectedUserWatchedFilms = user2WatchedFilms;
                filmsFile = user2FilmsFile;
                watchedFilmsFile = user2WatchedFilmsFile;
                break;
            default:
                userInteraction.displayError("Invalid user choice.");
                return;
        }

        if (selectedUserFilms.isEmpty()) {
            userInteraction.displayMessage("The movie list is empty for the selected user.");
            return;
        }

        Random random = new Random();
        int index = random.nextInt(selectedUserFilms.size());
        String randomFilm = selectedUserFilms.get(index);
        userInteraction.displayMessage("Random movie: " + randomFilm);

        selectedUserFilms.remove(index);
        selectedUserWatchedFilms.add(randomFilm);
        FileSaver.saveListToFile(selectedUserFilms, filmsFile);
        FileSaver.saveListToFile(selectedUserWatchedFilms, watchedFilmsFile);
    }
}
