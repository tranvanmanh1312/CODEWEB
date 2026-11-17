// Данные блюд загружаются только из локального файла api.json.
const API_URL = "api.json";

let dishes = [];

async function loadDishes() {
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error(`Ошибка загрузки блюд: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
        throw new Error("Неверный формат api.json");
    }

    dishes = data.map((dish) => ({
        ...dish,
        category: dish.category === "main-course" ? "main" : dish.category,
    }));
}
