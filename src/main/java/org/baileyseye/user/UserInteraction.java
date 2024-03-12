package org.baileyseye.user;

public interface UserInteraction {
    UserChoice getUserChoice();
    void displayMessage(String message);
    void displayError(String errorMessage);
}
