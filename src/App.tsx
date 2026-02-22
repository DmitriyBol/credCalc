import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MainCalc from "./components/mainCalc/mainCalc.tsx";

// Создаем экземпляр клиента
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <MainCalc />
        </QueryClientProvider>
    )
}

export default App;