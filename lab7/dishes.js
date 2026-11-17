// Lab 7: ưu tiên API chính thức; chỉ dùng dữ liệu mẫu khi API không truy cập được.
// Trên Netlify, /lab7/api/dishes được proxy qua netlify.toml.
const API_URL = "https://edu.std-900.ist.mospolytech.ru/labs/api/dishes";
const BACKUP_URL = "api.json";

let dishes = [];

async function getDishData(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Ошибка загрузки блюд: ${response.status} (${url})`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
        throw new Error(`Некорректный формат данных: ${url}`);
    }

    return data;
}

async function loadDishes() {
    let data;

    try {
        data = await getDishData(API_URL);
        console.info("Блюда загружены из API Московского Политеха.");
    } catch (error) {
        console.warn("API недоступен, загружаем демонстрационные данные:", error);
        data = await getDishData(BACKUP_URL);
        console.info("Демонстрационные блюда загружены из api.json.");
    }

    dishes = data.map((dish) => ({
        ...dish,
        category: dish.category === "main-course" ? "main" : dish.category,
    }));
}
