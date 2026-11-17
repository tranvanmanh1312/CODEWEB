function hasValidLunchCombo() {
    const soup = selectedDishes.soup !== undefined;
    const main = selectedDishes.main !== undefined;
    const salad = selectedDishes.salad !== undefined;
    const drink = selectedDishes.drink !== undefined;

    return (
        (soup && main && salad && drink)
        || (soup && main && !salad && drink)
        || (soup && !main && salad && drink)
        || (!soup && main && salad && drink)
        || (!soup && main && !salad && drink)
    );
}

function getLunchValidationMessage() {
    const soup = selectedDishes.soup !== undefined;
    const main = selectedDishes.main !== undefined;
    const salad = selectedDishes.salad !== undefined;
    const drink = selectedDishes.drink !== undefined;
    const dessert = selectedDishes.dessert !== undefined;

    const nothingSelected = !soup
        && !main
        && !salad
        && !drink
        && !dessert;

    if (nothingSelected) {
        return (
            "Ничего не выбрано. "
            + "Выберите блюда для заказа"
        );
    }

    if (hasValidLunchCombo()) {
        return "";
    }

    if (soup && !main && !salad) {
        return (
            "Выберите главное блюдо/"
            + "салат/стартер"
        );
    }

    if (salad && !soup && !main) {
        return "Выберите суп или главное блюдо";
    }

    if (!soup && !main && (drink || dessert)) {
        return "Выберите главное блюдо";
    }

    if (!drink) {
        return "Выберите напиток";
    }

    return "Выберите главное блюдо";
}

function showNotification(message) {
    const previousOverlay = document.querySelector(
        ".notification-overlay"
    );

    if (previousOverlay !== null) {
        previousOverlay.remove();
    }

    const overlay = document.createElement("div");
    overlay.className = "notification-overlay";

    const popup = document.createElement("div");
    popup.className = "notification-popup";
    popup.setAttribute("role", "alertdialog");
    popup.setAttribute("aria-modal", "true");

    const text = document.createElement("p");
    text.textContent = message;

    const button = document.createElement("button");
    button.className = "notification-button";
    button.type = "button";
    button.textContent = "Окей";

    button.addEventListener("click", () => {
        overlay.remove();
    });

    popup.append(text, button);
    overlay.append(popup);
    document.body.append(overlay);
    button.focus();
}
