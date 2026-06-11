# This file contains helper functions to create standardized API responses for success and error cases.

def success_response(data: dict, message: str = "") -> dict:
    """
    Return a standardized success response.
    """
    return {
        "status": "success",
        "message": message,
        "data": data
    }


def error_response(message: str, code: int = 400) -> dict:
    """
    Return a standardized error response.
    """
    return {
        "status": "error",
        "code": code,
        "message": message
    }
