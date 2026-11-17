const feedbackForm = document.getElementById(
    "feedback-form"
);
const feedbackSuccess = document.getElementById(
    "feedback-success"
);

feedbackForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!feedbackForm.reportValidity()) {
        return;
    }

    feedbackSuccess.classList.remove("d-none");
    feedbackForm.reset();
});
