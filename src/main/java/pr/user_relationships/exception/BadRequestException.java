package pr.user_relationships.exception;

class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}