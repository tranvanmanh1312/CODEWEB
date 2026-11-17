const DISHES_API_URL =
    "https://edu.std-900.ist.mospolytech.ru/labs/api/dishes";

let dishes = [];

async function loadDishes() {
    const response = await fetch(DISHES_API_URL);

    if (!response.ok) {
        throw new Error(
            `Ошибка загрузки блюд: ${response.status}`
        );
    }

    const data = await response.json();

    dishes = data.map((dish) => {
        if (dish.category === "main-course") {
            return {
                ...dish,
                category: "main",
            };
        }

        return dish;
    });
}
