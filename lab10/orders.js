let orders = [];
let toastTimer = undefined;

const orderDishFields = [
    {
        field: "soup_id",
        label: "Суп",
    },
    {
        field: "main_course_id",
        label: "Главное блюдо",
    },
    {
        field: "salad_id",
        label: "Салат или стартер",
    },
    {
        field: "drink_id",
        label: "Напиток",
    },
    {
        field: "dessert_id",
        label: "Десерт",
    },
];

function hasConfiguredApiKey() {
    return (
        API_KEY !== ""
        && API_KEY
            !== "PASTE_YOUR_UUIDV4_API_KEY_HERE"
    );
}

function buildOrdersUrl(orderId = undefined) {
    let url = ORDERS_API_URL;

    if (orderId !== undefined) {
        url += `/${orderId}`;
    }

    return (
        `${url}?api_key=`
        + encodeURIComponent(API_KEY)
    );
}

async function readResponseData(response) {
    try {
        return await response.json();
    } catch (error) {
        console.error(error);
        return {};
    }
}

async function requestJson(
    url,
    options = undefined
) {
    const response = await fetch(url, options);
    const data = await readResponseData(response);

    if (!response.ok) {
        const message = data.error
            || `Ошибка сервера: ${response.status}`;

        throw new Error(message);
    }

    return data;
}

async function loadOrders() {
    const data = await requestJson(
        buildOrdersUrl()
    );

    orders = [...data].sort((first, second) => {
        const firstDate = new Date(
            first.created_at
        );
        const secondDate = new Date(
            second.created_at
        );

        return secondDate - firstDate;
    });
}

function getDishById(dishId) {
    if (dishId === null || dishId === undefined) {
        return undefined;
    }

    return dishes.find((dish) => {
        return dish.id === Number(dishId);
    });
}

function getOrderDishes(order) {
    return orderDishFields
        .map((settings) => {
            return getDishById(
                order[settings.field]
            );
        })
        .filter((dish) => {
            return dish !== undefined;
        });
}

function getOrderComposition(order) {
    const orderDishes = getOrderDishes(order);

    if (orderDishes.length === 0) {
        return "Нет данных";
    }

    return orderDishes
        .map((dish) => {
            return dish.name;
        })
        .join(", ");
}

function getOrderTotal(order) {
    return getOrderDishes(order).reduce(
        (total, dish) => {
            return total + dish.price;
        },
        0
    );
}

function formatOrderDate(value) {
    if (!value) {
        return "Нет данных";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("ru-RU");
}

function formatDelivery(order) {
    if (
        order.delivery_type === "by_time"
        && order.delivery_time
    ) {
        return order.delivery_time;
    }

    return "Как можно скорее (с 7:00 до 23:00)";
}

function formatSubscribe(value) {
    return Number(value) === 1
        || value === true
        ? "Да"
        : "Нет";
}

function createCell(text) {
    const cell = document.createElement("td");
    cell.textContent = text;

    return cell;
}

function createActionButton(
    text,
    action,
    orderId
) {
    const button = document.createElement("button");
    button.className = "order-action-button";
    button.type = "button";
    button.dataset.action = action;
    button.dataset.orderId = orderId;
    button.textContent = text;

    return button;
}

function createOrderRow(order, index) {
    const row = document.createElement("tr");

    row.append(
        createCell(String(index + 1)),
        createCell(formatOrderDate(order.created_at)),
        createCell(getOrderComposition(order)),
        createCell(`${getOrderTotal(order)} ₽`),
        createCell(formatDelivery(order))
    );

    const actionsCell = document.createElement("td");
    const actions = document.createElement("div");
    actions.className = "order-actions";

    actions.append(
        createActionButton(
            "Подробнее",
            "details",
            order.id
        ),
        createActionButton(
            "Редактирование",
            "edit",
            order.id
        ),
        createActionButton(
            "Удаление",
            "delete",
            order.id
        )
    );

    actionsCell.append(actions);
    row.append(actionsCell);

    return row;
}

function renderOrders() {
    const body = document.getElementById(
        "orders-body"
    );
    const emptyMessage = document.getElementById(
        "orders-empty"
    );
    const tableWrapper = document.getElementById(
        "orders-table-wrapper"
    );

    body.innerHTML = "";

    orders.forEach((order, index) => {
        body.append(createOrderRow(order, index));
    });

    const isEmpty = orders.length === 0;

    emptyMessage.classList.toggle(
        "hidden",
        !isEmpty
    );
    tableWrapper.classList.toggle(
        "hidden",
        isEmpty
    );
}

function findOrder(orderId) {
    return orders.find((order) => {
        return order.id === Number(orderId);
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove("hidden");
    document.body.classList.add("modal-open");
}

function closeModal(modal) {
    modal.classList.add("hidden");

    const openedModal = document.querySelector(
        ".modal-overlay:not(.hidden)"
    );

    if (openedModal === null) {
        document.body.classList.remove(
            "modal-open"
        );
    }
}

function closeAllModals() {
    document
        .querySelectorAll(".modal-overlay")
        .forEach((modal) => {
            modal.classList.add("hidden");
        });

    document.body.classList.remove("modal-open");
}

function createDetailRow(label, value) {
    const row = document.createElement("div");
    row.className = "detail-row";

    const labelElement = document.createElement(
        "div"
    );
    labelElement.className = "detail-label";
    labelElement.textContent = label;

    const valueElement = document.createElement(
        "div"
    );
    valueElement.className = "detail-value";
    valueElement.textContent =
        value === "" || value === null
            ? "—"
            : String(value);

    row.append(labelElement, valueElement);

    return row;
}

function showOrderDetails(order) {
    const content = document.getElementById(
        "details-content"
    );

    content.innerHTML = "";

    const details = [
        [
            "Номер заказа",
            order.id,
        ],
        [
            "Дата оформления",
            formatOrderDate(order.created_at),
        ],
        [
            "Имя",
            order.full_name,
        ],
        [
            "Email",
            order.email,
        ],
        [
            "Телефон",
            order.phone,
        ],
        [
            "Адрес доставки",
            order.delivery_address,
        ],
        [
            "Время доставки",
            formatDelivery(order),
        ],
        [
            "Состав заказа",
            getOrderComposition(order),
        ],
        [
            "Стоимость",
            `${getOrderTotal(order)} ₽`,
        ],
        [
            "Подписка",
            formatSubscribe(order.subscribe),
        ],
        [
            "Комментарий",
            order.comment || "—",
        ],
    ];

    details.forEach(([label, value]) => {
        content.append(
            createDetailRow(label, value)
        );
    });

    openModal("details-modal");
}

function setDeliveryTimeRequired() {
    const form = document.getElementById(
        "edit-order-form"
    );
    const deliveryType = form.elements
        .delivery_type.value;
    const timeInput = form.elements
        .delivery_time;

    timeInput.required =
        deliveryType === "by_time";

    if (deliveryType !== "by_time") {
        timeInput.value = "";
    }
}

function fillEditForm(order) {
    const form = document.getElementById(
        "edit-order-form"
    );

    document.getElementById(
        "edit-order-id"
    ).value = order.id;

    form.elements.full_name.value =
        order.full_name || "";
    form.elements.email.value =
        order.email || "";
    form.elements.phone.value =
        order.phone || "";
    form.elements.delivery_address.value =
        order.delivery_address || "";
    form.elements.comment.value =
        order.comment || "";

    const type = order.delivery_type === "by_time"
        ? "by_time"
        : "now";

    form.elements.delivery_type.value = type;
    form.elements.delivery_time.value =
        type === "by_time"
            ? order.delivery_time || ""
            : "";

    setDeliveryTimeRequired();
}

function showEditModal(order) {
    fillEditForm(order);
    openModal("edit-modal");
}

function showDeleteModal(order) {
    document.getElementById(
        "delete-order-id"
    ).value = order.id;

    openModal("delete-modal");
}

function showToast(message, type) {
    const toast = document.getElementById("toast");

    toast.className = `toast ${type}`;
    toast.textContent = message;

    if (toastTimer !== undefined) {
        clearTimeout(toastTimer);
    }

    toastTimer = setTimeout(() => {
        toast.className = "toast hidden";
    }, 3500);
}

function buildEditPayload(form) {
    const deliveryType = form.elements
        .delivery_type.value;

    const payload = {
        full_name:
            form.elements.full_name.value.trim(),
        email:
            form.elements.email.value.trim(),
        phone:
            form.elements.phone.value.trim(),
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

    return payload;
}

async function handleEditSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;

    if (!form.reportValidity()) {
        return;
    }

    const orderId = Number(
        document.getElementById(
            "edit-order-id"
        ).value
    );
    const payload = buildEditPayload(form);

    try {
        await requestJson(
            buildOrdersUrl(orderId),
            {
                method: "PUT",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify(payload),
            }
        );

        closeAllModals();
        await loadOrders();
        renderOrders();

        showToast(
            "Заказ успешно изменён",
            "success"
        );
    } catch (error) {
        console.error(error);
        showToast(
            `Ошибка: ${error.message}`,
            "error"
        );
    }
}

async function handleDeleteConfirm() {
    const orderId = Number(
        document.getElementById(
            "delete-order-id"
        ).value
    );

    try {
        await requestJson(
            buildOrdersUrl(orderId),
            {
                method: "DELETE",
            }
        );

        closeAllModals();
        await loadOrders();
        renderOrders();

        showToast(
            "Заказ успешно удалён",
            "success"
        );
    } catch (error) {
        console.error(error);
        showToast(
            `Ошибка: ${error.message}`,
            "error"
        );
    }
}

function handleOrdersClick(event) {
    const button = event.target.closest(
        "[data-action]"
    );

    if (button === null) {
        return;
    }

    const order = findOrder(
        button.dataset.orderId
    );

    if (order === undefined) {
        return;
    }

    if (button.dataset.action === "details") {
        showOrderDetails(order);
        return;
    }

    if (button.dataset.action === "edit") {
        showEditModal(order);
        return;
    }

    if (button.dataset.action === "delete") {
        showDeleteModal(order);
    }
}

function connectModalControls() {
    document
        .querySelectorAll("[data-close-modal]")
        .forEach((button) => {
            button.addEventListener(
                "click",
                () => {
                    const modal = button.closest(
                        ".modal-overlay"
                    );
                    closeModal(modal);
                }
            );
        });

    document
        .querySelectorAll(".modal-overlay")
        .forEach((modal) => {
            modal.addEventListener(
                "click",
                (event) => {
                    if (event.target === modal) {
                        closeModal(modal);
                    }
                }
            );
        });
}

function connectEditDeliveryType() {
    document
        .querySelectorAll(
            '#edit-order-form '
            + 'input[name="delivery_type"]'
        )
        .forEach((radio) => {
            radio.addEventListener(
                "change",
                setDeliveryTimeRequired
            );
        });
}

async function initOrdersPage() {
    connectModalControls();
    connectEditDeliveryType();

    document.getElementById(
        "orders-body"
    ).addEventListener(
        "click",
        handleOrdersClick
    );

    document.getElementById(
        "edit-order-form"
    ).addEventListener(
        "submit",
        handleEditSubmit
    );

    document.getElementById(
        "confirm-delete-button"
    ).addEventListener(
        "click",
        handleDeleteConfirm
    );

    if (!hasConfiguredApiKey()) {
        showToast(
            "Укажите персональный API Key "
            + "в файле config.js",
            "error"
        );
        return;
    }

    try {
        await Promise.all([
            loadDishes(),
            loadOrders(),
        ]);

        renderOrders();
    } catch (error) {
        console.error(error);
        showToast(
            `Ошибка: ${error.message}`,
            "error"
        );
    }
}

initOrdersPage();
