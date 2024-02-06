package org.baileyseye;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import java.io.*;
import java.util.Scanner;

public class FilmRandomizer {
    private List<String> user1Films;
    private List<String> user2Films;
    private List<String> user1WatchedFilms;
    private List<String> user2WatchedFilms;
    private static final String USER1_FILMS_FILE = "data/user1_films.txt";
    private static final String USER2_FILMS_FILE = "data/user2_films.txt";
    private static final String USER1_WATCHED_FILMS_FILE = "data/user1_watched_films.txt";
    private static final String USER2_WATCHED_FILMS_FILE = "data/user2_watched_films.txt";

    public static void main(String[] args) {
        FilmRandomizer filmRandomizer = new FilmRandomizer();
        filmRandomizer.printRandomFilm();
        filmRandomizer.printWatchedFilms();
    }

    public FilmRandomizer() {
        user1Films = loadListFromFile(USER1_FILMS_FILE);
        user2Films = loadListFromFile(USER2_FILMS_FILE);
        user1WatchedFilms = loadListFromFile(USER1_WATCHED_FILMS_FILE);
        user2WatchedFilms = loadListFromFile(USER2_WATCHED_FILMS_FILE);
    }

    public void printRandomFilm() {
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
                filmsFile = USER1_FILMS_FILE;
                watchedFilmsFile = USER1_WATCHED_FILMS_FILE;
                break;
            case 2:
                selectedUserFilms = user2Films;
                selectedUserWatchedFilms = user2WatchedFilms;
                filmsFile = USER2_FILMS_FILE;
                watchedFilmsFile = USER2_WATCHED_FILMS_FILE;
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
        saveListToFile(selectedUserFilms, filmsFile);
        saveListToFile(selectedUserWatchedFilms, watchedFilmsFile);
    }

    public void printWatchedFilms() {
        Scanner scanner = new Scanner(System.in);
        System.out.println("Want to see a list of watched movies? (Y/N)");
        String response = scanner.nextLine().trim().toUpperCase();
        if (response.equals("Y")) {
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

    private List<String> loadListFromFile(String filename) {
        List<String> list = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(filename))) {
            String line;
            while ((line = reader.readLine()) != null) {
                list.add(line);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return list;
    }

    private void saveListToFile(List<String> list, String filename) {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(filename))) {
            for (String item : list) {
                writer.write(item);
                writer.newLine();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}

