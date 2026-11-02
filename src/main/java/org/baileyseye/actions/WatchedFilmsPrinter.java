package org.baileyseye.actions;

import static lombok.AccessLevel.PRIVATE;

import java.util.List;
import lombok.NoArgsConstructor;
import org.baileyseye.user.UserInteraction;

@NoArgsConstructor(access = PRIVATE)
public final class WatchedFilmsPrinter {

    public static void printWatchedFilms(UserInteraction userInteraction, UserData... users) {
        if (!userInteraction.confirm("Хотите посмотреть список просмотренных фильмов? (Д/Н)")) {
            userInteraction.displayMessage("Список просмотренных фильмов не будет показан.");
            return;
        }

        userInteraction.displayMessage("Просмотренные фильмы: ");

        for (UserData user : users) {
            List<String> watchedFilms = user.watchedFilms();

            if (!watchedFilms.isEmpty()) {
                userInteraction.displayMessage(user.label() + ":");
                userInteraction.displayMessage(String.join(System.lineSeparator(), watchedFilms));
            }
        }
    }
}
