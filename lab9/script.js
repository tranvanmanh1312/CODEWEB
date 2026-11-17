const activeFilters = {
    soup: undefined,
    main: undefined,
    salad: undefined,
    drink: undefined,
    dessert: undefined,
};

const categorySettings = {
    soup: {
        containerId: "soups",
    },
    main: {
        containerId: "main-courses",
    },
    salad: {
        containerId: "salads",
    },
    drink: {
        containerId: "drinks",
    },
    dessert: {
        containerId: "desserts",
    },
};

function updateSelectedCards() {
    document.querySelectorAll(".dish-card").forEach((card) => {
        const dishId = Number(card.dataset.dishId);

        const dish = dishes.find((item) => {
            return item.id === dishId;
        });

        if (dish === undefined) {
            return;
        }

        const selected = selectedDishes[dish.category];
        const isSelected = selected !== undefined
            && selected.id === dish.id;

        card.classList.toggle("selected", isSelected);
    });
}

function updateCheckoutPanel() {
    const panel = document.getElementById("checkout-panel");
    const totalElement = document.getElementById(
        "checkout-total"
    );
    const checkoutLink = document.getElementById(
        "checkout-link"
    );
    const total = getOrderTotal();
    const hasSelectedDish = total > 0;

    panel.classList.toggle("hidden", !hasSelectedDish);
    totalElement.textContent = total;

    if (hasValidLunchCombo()) {
        checkoutLink.href = "order.html";
        checkoutLink.classList.remove("disabled");
        checkoutLink.setAttribute(
            "aria-disabled",
            "false"
        );
        return;
    }

    checkoutLink.removeAttribute("href");
    checkoutLink.classList.add("disabled");
    checkoutLink.setAttribute(
        "aria-disabled",
        "true"
    );
}

function selectDish(dish) {
    selectedDishes[dish.category] = dish;
    saveSelectedDishes();
    updateSelectedCards();
    updateCheckoutPanel();
}

function handleAddButton(event) {
    const card = event.currentTarget.closest(".dish-card");
    const dishId = Number(card.dataset.dishId);

    const dish = dishes.find((item) => {
        return item.id === dishId;
    });

    if (dish !== undefined) {
        selectDish(dish);
    }
}

function createDishCard(dish) {
    const card = document.createElement("div");
    card.className = "dish-card";
    card.dataset.dishId = dish.id;

    const image = document.createElement("img");
    image.src = dish.image;
    image.alt = dish.name;
    image.width = 600;
    image.height = 400;

    const price = document.createElement("p");
    price.className = "dish-price";
    price.textContent = `${dish.price} ₽`;

    const name = document.createElement("p");
    name.className = "dish-name";
    name.textContent = dish.name;

    const count = document.createElement("p");
    count.className = "dish-weight";
    count.textContent = dish.count;

    const button = document.createElement("button");
    button.className = "add-button";
    button.type = "button";
    button.textContent = "Добавить";
    button.addEventListener(
        "click",
        handleAddButton
    );

    card.append(
        image,
        price,
        name,
        count,
        button
    );

    return card;
}

function getCategoryDishes(category) {
    const currentFilter = activeFilters[category];

    return dishes
        .filter((dish) => {
            const sameCategory = dish.category === category;

            if (currentFilter === undefined) {
                return sameCategory;
            }

            return (
                sameCategory
                && dish.kind === currentFilter
            );
        })
        .sort((first, second) => {
            return first.name.localeCompare(
                second.name,
                "ru"
            );
        });
}

function renderCategory(category) {
    const settings = categorySettings[category];
    const container = document.getElementById(
        settings.containerId
    );

    container.innerHTML = "";

    getCategoryDishes(category).forEach((dish) => {
        container.append(createDishCard(dish));
    });
}

function renderDishes() {
    Object.keys(categorySettings).forEach((category) => {
        renderCategory(category);
    });

    updateSelectedCards();
}

function setFilterButtonState(
    filtersBlock,
    activeKind
) {
    filtersBlock
        .querySelectorAll("[data-kind]")
        .forEach((button) => {
            const isActive =
                button.dataset.kind === activeKind;

            button.classList.toggle(
                "active",
                isActive
            );
        });
}

function handleFilterClick(event) {
    const button = event.target.closest("[data-kind]");

    if (button === null) {
        return;
    }

    const filtersBlock = button.closest(".filters");
    const category = filtersBlock.dataset.category;
    const kind = button.dataset.kind;
    const currentFilter = activeFilters[category];

    if (currentFilter === kind) {
        activeFilters[category] = undefined;
    } else {
        activeFilters[category] = kind;
    }

    setFilterButtonState(
        filtersBlock,
        activeFilters[category]
    );
    renderCategory(category);
    updateSelectedCards();
}

function connectFilters() {
    document
        .querySelectorAll(".filters")
        .forEach((filtersBlock) => {
            filtersBlock.addEventListener(
                "click",
                handleFilterClick
            );
        });
}

async function init() {
    try {
        await loadDishes();
        restoreSelectedDishes();
        renderDishes();
        connectFilters();
        updateCheckoutPanel();
    } catch (error) {
        console.error(error);
        showNotification(
            "Не удалось загрузить блюда. "
            + "Попробуйте обновить страницу."
        );
    }
}

init();
