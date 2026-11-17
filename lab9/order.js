const orderCategorySettings = {
    soup: {
        textId: "order-soup",
        emptyText: "Не выбран",
    },
    main: {
        textId: "order-main",
        emptyText: "Не выбрано",
    },
    salad: {
        textId: "order-salad",
        emptyText: "Не выбран",
    },
    drink: {
        textId: "order-drink",
        emptyText: "Не выбран",
    },
    dessert: {
        textId: "order-dessert",
        emptyText: "Не выбран",
    },
};

function formatOrderLine(dish) {
    return `${dish.name} — ${dish.price} ₽`;
}

function renderOrderSummary() {
    Object.keys(orderCategorySettings).forEach(
        (category) => {
            const settings =
                orderCategorySettings[category];
            const element = document.getElementById(
                settings.textId
            );
            const dish = selectedDishes[category];

            if (dish === undefined) {
                element.textContent =
                    settings.emptyText;
                return;
            }

            element.textContent =
                formatOrderLine(dish);
        }
    );

    document.getElementById(
        "order-total-price"
    ).textContent = getOrderTotal();
}

function handleRemoveButton(event) {
    const card = event.currentTarget.closest(
        ".dish-card"
    );
    const category = card.dataset.category;

    removeSelectedDish(category);
    renderOrderCards();
    renderOrderSummary();
}

function createOrderCard(dish) {
    const card = document.createElement("div");
    card.className = "dish-card";
    card.dataset.category = dish.category;

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
    button.className = "remove-button";
    button.type = "button";
    button.textContent = "Удалить";
    button.addEventListener(
        "click",
        handleRemoveButton
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

function renderOrderCards() {
    const container = document.getElementById(
        "order-cards"
    );
    const emptyMessage = document.getElementById(
        "empty-order"
    );
    const selected = ORDER_CATEGORIES
        .map((category) => {
            return selectedDishes[category];
        })
        .filter((dish) => {
            return dish !== undefined;
        });

    container.innerHTML = "";

    selected.forEach((dish) => {
        container.append(createOrderCard(dish));
    });

    const isEmpty = selected.length === 0;

    emptyMessage.classList.toggle(
        "hidden",
        !isEmpty
    );
    container.classList.toggle(
        "hidden",
        isEmpty
    );
}

function updateDeliveryTimeState() {
    const selectedType = document.querySelector(
        'input[name="delivery_type"]:checked'
    );
    const timeInput = document.getElementById(
        "delivery-time"
    );

    const byTime = selectedType !== null
        && selectedType.value === "by_time";

    timeInput.required = byTime;

    if (!byTime) {
        timeInput.value = "";
    }
}

function connectDeliveryType() {
    document
        .querySelectorAll(
            'input[name="delivery_type"]'
        )
        .forEach((radio) => {
            radio.addEventListener(
                "change",
                updateDeliveryTimeState
            );
        });
}

function hasConfiguredApiKey() {
    return (
        API_KEY !== ""
        && API_KEY
            !== "PASTE_YOUR_UUIDV4_API_KEY_HERE"
    );
}

function addDishIdsToPayload(payload) {
    if (selectedDishes.soup !== undefined) {
        payload.soup_id = selectedDishes.soup.id;
    }

    if (selectedDishes.main !== undefined) {
        payload.main_course_id =
            selectedDishes.main.id;
    }

    if (selectedDishes.salad !== undefined) {
        payload.salad_id =
            selectedDishes.salad.id;
    }

    if (selectedDishes.drink !== undefined) {
        payload.drink_id =
            selectedDishes.drink.id;
    }

    if (selectedDishes.dessert !== undefined) {
        payload.dessert_id =
            selectedDishes.dessert.id;
    }
}

function buildOrderPayload(form) {
    const deliveryType = form.elements
        .delivery_type.value;

    const payload = {
        full_name: form.elements.full_name
            .value.trim(),
        email: form.elements.email.value.trim(),
        subscribe:
            form.elements.subscribe.checked
                ? 1
                : 0,
        phone: form.elements.phone.value.trim(),
        delivery_address:
            form.elements.delivery_address
                .value.trim(),
        delivery_type: deliveryType,
        comment:
            form.elements.comment.value.trim(),
    };

    if (deliveryType === "by_time") {
        payload.delivery_time =
            form.elements.delivery_time.value;
    }

    addDishIdsToPayload(payload);

    return payload;
}

async function sendOrder(payload) {
    const requestUrl =
        `${ORDERS_API_URL}?api_key=`
        + encodeURIComponent(API_KEY);

    const response = await fetch(
        requestUrl,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }
    );

    let responseData = {};

    try {
        responseData = await response.json();
    } catch (error) {
        console.error(error);
    }

    if (!response.ok) {
        const message =
            responseData.error
            || `Ошибка сервера: ${response.status}`;

        throw new Error(message);
    }

    return responseData;
}

async function handleOrderSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const validationMessage =
        getLunchValidationMessage();

    if (validationMessage !== "") {
        showNotification(validationMessage);
        return;
    }

    if (!hasConfiguredApiKey()) {
        showNotification(
            "Укажите персональный API Key "
            + "в файле config.js"
        );
        return;
    }

    if (!form.reportValidity()) {
        return;
    }

    const payload = buildOrderPayload(form);

    try {
        await sendOrder(payload);
        clearSelectedDishes();

        window.alert(
            "Заказ успешно оформлен"
        );
        window.location.href = "lunch.html";
    } catch (error) {
        console.error(error);
        showNotification(
            "Не удалось оформить заказ. "
            + error.message
        );
    }
}

async function initOrderPage() {
    try {
        await loadDishes();
        restoreSelectedDishes();
        renderOrderCards();
        renderOrderSummary();
        connectDeliveryType();
        updateDeliveryTimeState();

        document
            .querySelector(".order-form")
            .addEventListener(
                "submit",
                handleOrderSubmit
            );
    } catch (error) {
        console.error(error);
        showNotification(
            "Не удалось загрузить данные заказа. "
            + "Попробуйте обновить страницу."
        );
    }
}

initOrderPage();
