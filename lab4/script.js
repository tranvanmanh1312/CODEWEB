/* Хранит выбранные блюда по категориям. */
const selectedDishes = {
    soup: undefined,
    main: undefined,
    drink: undefined,
};

/* Настройки связывают категории с HTML-элементами формы и меню. */
const categorySettings = {
    soup: {
        containerId: "soups",
        textId: "selected-soup",
        inputId: "soup-keyword",
        emptyText: "Блюдо не выбрано",
    },
    main: {
        containerId: "main-courses",
        textId: "selected-main",
        inputId: "main-keyword",
        emptyText: "Блюдо не выбрано",
    },
    drink: {
        containerId: "drinks",
        textId: "selected-drink",
        inputId: "drink-keyword",
        emptyText: "Напиток не выбран",
    },
};

/* Формирует текст с названием блюда и его ценой. */
function formatDishText(dish) {
    return `${dish.name} ${dish.price} ₽`;
}

/* Обновляет текст выбранного блюда в нужной категории заказа. */
function updateOrderCategory(category) {
    const settings = categorySettings[category];
    const textElement = document.getElementById(settings.textId);
    const dish = selectedDishes[category];

    if (dish === undefined) {
        textElement.textContent = settings.emptyText;
        return;
    }

    textElement.textContent = formatDishText(dish);
}

/* Записывает keyword выбранных блюд в скрытые поля формы. */
function updateHiddenInputs() {
    Object.keys(categorySettings).forEach((category) => {
        const settings = categorySettings[category];
        const input = document.getElementById(settings.inputId);
        const dish = selectedDishes[category];

        input.value = dish === undefined ? "" : dish.keyword;
    });
}

/* Добавляет класс selected выбранной карточке блюда. */
function updateSelectedCards() {
    document.querySelectorAll(".dish-card").forEach((card) => {
        const dish = dishes.find((item) => {
            return item.keyword === card.dataset.dish;
        });

        if (dish === undefined) {
            return;
        }

        const selected = selectedDishes[dish.category];
        const isSelected = selected !== undefined
            && selected.keyword === dish.keyword;

        card.classList.toggle("selected", isSelected);
    });
}

/* Считает общую стоимость всех выбранных блюд. */
function updateTotal() {
    const totalBlock = document.getElementById("order-total");
    const totalPrice = document.getElementById("total-price");

    const total = Object.values(selectedDishes).reduce(
        (sum, dish) => {
            return dish === undefined ? sum : sum + dish.price;
        },
        0
    );

    totalPrice.textContent = total;
    totalBlock.classList.toggle("hidden", total === 0);
}

/* Полностью обновляет блок «Ваш заказ». */
function renderOrder() {
    const nothingSelected = document.getElementById(
        "nothing-selected"
    );
    const selectedItems = document.getElementById("selected-items");

    const hasSelectedDish = Object.values(selectedDishes).some(
        (dish) => dish !== undefined
    );

    nothingSelected.classList.toggle("hidden", hasSelectedDish);
    selectedItems.classList.toggle("hidden", !hasSelectedDish);

    Object.keys(categorySettings).forEach((category) => {
        updateOrderCategory(category);
    });

    updateHiddenInputs();
    updateSelectedCards();
    updateTotal();
}

/* Сохраняет выбранное блюдо и обновляет заказ. */
function selectDish(dish) {
    selectedDishes[dish.category] = dish;
    renderOrder();
}

/* Обрабатывает клик по кнопке «Добавить» и находит блюдо по data-dish. */
function handleAddButton(event) {
    const card = event.currentTarget.closest(".dish-card");
    const keyword = card.dataset.dish;

    const dish = dishes.find((item) => {
        return item.keyword === keyword;
    });

    if (dish !== undefined) {
        selectDish(dish);
    }
}

/* Создаёт HTML-карточку блюда с помощью DOM. */
function createDishCard(dish) {
    const card = document.createElement("div");
    card.className = "dish-card";
    card.dataset.dish = dish.keyword;

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
    button.addEventListener("click", handleAddButton);

    card.append(image, price, name, count, button);

    return card;
}

/* Фильтрует блюда по категории, сортирует и выводит их на страницу. */
function renderCategory(category) {
    const settings = categorySettings[category];
    const container = document.getElementById(settings.containerId);

    const categoryDishes = dishes
        .filter((dish) => dish.category === category)
        .sort((first, second) => {
            return first.name.localeCompare(second.name, "ru");
        });

    categoryDishes.forEach((dish) => {
        container.append(createDishCard(dish));
    });
}

/* Запускает отображение блюд для всех категорий. */
function renderDishes() {
    Object.keys(categorySettings).forEach((category) => {
        renderCategory(category);
    });
}

/* Очищает выбранные блюда и возвращает заказ в начальное состояние. */
function resetOrder() {
    Object.keys(selectedDishes).forEach((category) => {
        selectedDishes[category] = undefined;
    });

    renderOrder();
}

/* Обработчик кнопки сброса формы. */
function handleFormReset() {
    resetOrder();
}

/* Получаем форму и запускаем начальное отображение страницы. */
const orderForm = document.querySelector(".order-form");

renderDishes();
renderOrder();
orderForm.addEventListener("reset", handleFormReset);
