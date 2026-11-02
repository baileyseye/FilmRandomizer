package org.baileyseye.user;

import java.util.Optional;

public interface UserInteraction {

    Optional<UserChoice> getUserChoice();

    boolean confirm(String question);

    void displayMessage(String message);

    void displayError(String errorMessage);
}
