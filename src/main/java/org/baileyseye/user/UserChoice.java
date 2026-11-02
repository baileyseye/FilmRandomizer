package org.baileyseye.user;

import java.util.Arrays;
import java.util.Optional;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum UserChoice {

    USER1(1),
    USER2(2);

    private final int code;

    public static Optional<UserChoice> fromCode(int code) {
        return Arrays.stream(values())
            .filter(choice -> choice.code == code)
            .findFirst();
    }
}
