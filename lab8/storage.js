const STORAGE_KEY =
    "vietnamese-station-selected-dish-ids";

const ORDER_CATEGORIES = [
    "soup",
    "main",
    "salad",
    "drink",
    "dessert",
];

const selectedDishes = {
    soup: undefined,
    main: undefined,
    salad: undefined,
    drink: undefined,
    dessert: undefined,
};

function getStoredDishIds() {
    const rawValue = localStorage.getItem(STORAGE_KEY);

    if (rawValue === null) {
        return {};
    }

    try {
        const parsedValue = JSON.parse(rawValue);

        if (
            parsedValue === null
            || Array.isArray(parsedValue)
            || typeof parsedValue !== "object"
        ) {
            return {};
        }

        return parsedValue;
    } catch (error) {
        console.error(error);
        return {};
    }
}

function saveSelectedDishes() {
    const dishIds = {};

    ORDER_CATEGORIES.forEach((category) => {
        const dish = selectedDishes[category];

        if (dish !== undefined) {
            dishIds[category] = dish.id;
        }
    });

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(dishIds)
    );
}

function restoreSelectedDishes() {
    const dishIds = getStoredDishIds();

    ORDER_CATEGORIES.forEach((category) => {
        const storedId = Number(dishIds[category]);

        if (!Number.isInteger(storedId)) {
            selectedDishes[category] = undefined;
            return;
        }

        selectedDishes[category] = dishes.find((dish) => {
            return dish.id === storedId && dish.category === category;
        });
    });
}

function removeSelectedDish(category) {
    selectedDishes[category] = undefined;
    saveSelectedDishes();
}

function clearSelectedDishes() {
    ORDER_CATEGORIES.forEach((category) => {
        selectedDishes[category] = undefined;
    });

    localStorage.removeItem(STORAGE_KEY);
}

function getOrderTotal() {
    return Object.values(selectedDishes).reduce(
        (total, dish) => {
            if (dish === undefined) {
                return total;
            }

            return total + dish.price;
        },
        0
    );
}
