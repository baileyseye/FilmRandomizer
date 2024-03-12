package org.baileyseye;

import java.util.List;
import java.util.Scanner;

public class WatchedFilmsPrinter {
    public static void printWatchedFilms(List<String> user1WatchedFilms, List<String> user2WatchedFilms) {
        Scanner scanner = new Scanner(System.in);
        System.out.println("Want to see a list of watched movies? (Y/N)");
        String response = scanner.nextLine().trim().toUpperCase();
        if ("Y".equals(response)) {
            System.out.println("Watched movies: ");
            if (!user1WatchedFilms.isEmpty()) {
                System.out.println("User 1:");
                for (String film : user1WatchedFilms) {
                    System.out.println(film);
                }
            }
            if (!user2WatchedFilms.isEmpty()) {
                System.out.println("User 2:");
                for (String film : user2WatchedFilms) {
                    System.out.println(film);
                }
            }
        } else {
            System.out.println("The list of watched movies will not be shown.");
        }
    }
}
