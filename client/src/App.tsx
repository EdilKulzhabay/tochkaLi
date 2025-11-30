import { RouterProvider } from "react-router-dom";
import { routes } from "./routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";

function App() {
    // Инициализация Telegram WebApp при монтировании компонента
    // Это дополнительная гарантия для случаев, когда main.tsx не успел выполниться
    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (tg) {
            // Вызываем ready() и expand() для гарантии полной высоты
            tg.ready();
            tg.expand();
            
            // Дополнительная проверка через небольшую задержку
            setTimeout(() => {
                if (!tg.isExpanded) {
                    tg.expand();
                }
            }, 100);
            
            // Обрабатываем изменения viewport
            tg.onEvent('viewportChanged', () => {
                if (!tg.isExpanded) {
                    tg.expand();
                }
            });
        }
    }, []);
    
    return (
        <>
            <RouterProvider router={routes} />
            <ToastContainer 
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </>
    )
}

export default App
