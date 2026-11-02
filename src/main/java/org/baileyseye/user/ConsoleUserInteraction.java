package org.baileyseye.user;

import java.util.Optional;
import java.util.Scanner;

public class ConsoleUserInteraction implements UserInteraction, AutoCloseable {

    private final Scanner scanner = new Scanner(System.in);

    @Override
    public Optional<UserChoice> getUserChoice() {
        displayMessage("Выберите пользователя: введите 1 для Пользователя 1 или 2 для Пользователя 2");

        String input = nextLine();

        try {
            return UserChoice.fromCode(Integer.parseInt(input));
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }

    @Override
    public boolean confirm(String question) {
        displayMessage(question);
        String answer = nextLine();
        return answer.regionMatches(true, 0, "Y", 0, 1) || answer.regionMatches(true, 0, "Д", 0, 1);
    }

    @Override
    public void displayMessage(String message) {
        System.out.println(message);
    }

    @Override
    public void displayError(String errorMessage) {
        System.err.println(errorMessage);
    }

    private String nextLine() {
        return scanner.hasNextLine() ? scanner.nextLine().trim() : "";
    }

    @Override
    public void close() {
        scanner.close();
    }
}
