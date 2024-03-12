package org.baileyseye;

import java.util.Scanner;

public class ConsoleUserInteraction implements UserInteraction {
    private final Scanner scanner = new Scanner(System.in);

    @Override
    public UserChoice getUserChoice() {
        System.out.println("Which user do you choose? (Enter 1 for USER1 or 2 for USER2)");
        int choice = scanner.nextInt();
        scanner.nextLine();
        return switch (choice) {
            case 1 -> UserChoice.USER1;
            case 2 -> UserChoice.USER2;
            default -> throw new IllegalArgumentException("Invalid user choice: " + choice);
        };
    }

    @Override
    public void displayMessage(String message) {
        System.out.println(message);
    }

    @Override
    public void displayError(String errorMessage) {
        System.err.println(errorMessage);
    }
}
