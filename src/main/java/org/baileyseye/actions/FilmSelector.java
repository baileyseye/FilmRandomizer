package org.baileyseye.actions;

import java.util.List;
import java.util.Random;
import lombok.RequiredArgsConstructor;
import org.baileyseye.user.UserChoice;
import org.baileyseye.user.UserInteraction;

@RequiredArgsConstructor
public class FilmSelector {

    private static final Random RANDOM = new Random();

    private final UserInteraction userInteraction;

    public void selectAndPrintRandomFilm(UserData user1, UserData user2) {
        UserData selectedUser = userInteraction.getUserChoice()
            .map(choice -> choice == UserChoice.USER1 ? user1 : user2)
            .orElse(null);

        if (selectedUser == null) {
            userInteraction.displayError("Неверный выбор пользователя.");
            return;
        }

        List<String> films = selectedUser.films();
        if (films.isEmpty()) {
            userInteraction.displayMessage("Список фильмов пуст для выбранного пользователя.");
            return;
        }

        int index = RANDOM.nextInt(films.size());

        String randomFilm = films.remove(index);
        userInteraction.displayMessage("Случайный фильм: " + randomFilm);

        selectedUser.watchedFilms().add(randomFilm);

        FileSaver.saveListToFile(films, selectedUser.filmsFile());
        FileSaver.saveListToFile(selectedUser.watchedFilms(), selectedUser.watchedFilmsFile());
    }
}
