package org.baileyseye;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import java.io.*;
import java.util.Scanner;

public class FilmRandomizer {
    private List<String> user1Films;
    private List<String> user2Films;
    private List<String> user1DeletedFilms;
    private List<String> user2DeletedFilms;
    private static final String USER1_FILMS_FILE = "data/user1_films.txt";
    private static final String USER2_FILMS_FILE = "data/user2_films.txt";
    private static final String USER1_DELETED_FILMS_FILE = "data/user1_deleted_films.txt";
    private static final String USER2_DELETED_FILMS_FILE = "data/user2_deleted_films.txt";

    public static void main(String[] args) {
        FilmRandomizer filmRandomizer = new FilmRandomizer();
        filmRandomizer.printRandomFilm();
        filmRandomizer.printDeletedFilms();
    }

    public FilmRandomizer() {
        user1Films = loadListFromFile(USER1_FILMS_FILE);
        user2Films = loadListFromFile(USER2_FILMS_FILE);
        user1DeletedFilms = loadListFromFile(USER1_DELETED_FILMS_FILE);
        user2DeletedFilms = loadListFromFile(USER2_DELETED_FILMS_FILE);
    }

    public void printRandomFilm() {
        Scanner scanner = new Scanner(System.in);

        System.out.println("Which user do you choose? (Enter 1 or 2)");
        int userChoice = scanner.nextInt();
        scanner.nextLine();

        List<String> selectedUserFilms;
        List<String> selectedUserDeletedFilms;
        String filmsFile;
        String deletedFilmsFile;

        switch (userChoice) {
            case 1:
                selectedUserFilms = user1Films;
                selectedUserDeletedFilms = user1DeletedFilms;
                filmsFile = USER1_FILMS_FILE;
                deletedFilmsFile = USER1_DELETED_FILMS_FILE;
                break;
            case 2:
                selectedUserFilms = user2Films;
                selectedUserDeletedFilms = user2DeletedFilms;
                filmsFile = USER2_FILMS_FILE;
                deletedFilmsFile = USER2_DELETED_FILMS_FILE;
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
        selectedUserDeletedFilms.add(randomFilm);
        saveListToFile(selectedUserFilms, filmsFile);
        saveListToFile(selectedUserDeletedFilms, deletedFilmsFile);
    }

    public void printDeletedFilms() {
        Scanner scanner = new Scanner(System.in);
        System.out.println("Want to see a list of deleted movies? (Y/N)");
        String response = scanner.nextLine().trim().toUpperCase();
        if (response.equals("Y")) {
            System.out.println("Deleted movies: ");
            if (!user1DeletedFilms.isEmpty()) {
                System.out.println("User 1:");
                for (String film : user1DeletedFilms) {
                    System.out.println(film);
                }
            }
            if (!user2DeletedFilms.isEmpty()) {
                System.out.println("User 2:");
                for (String film : user2DeletedFilms) {
                    System.out.println(film);
                }
            }
        } else {
            System.out.println("The list of deleted movies will not be shown.");
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

