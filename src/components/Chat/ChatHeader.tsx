import MenuIcon from '../icons/MenuIcon';

interface Props {
    onMenuClick: () => void;
}

export default function ChatHeader({ onMenuClick }: Props) {
    return (
        <header className="bg-background text-white p-2 md:p-4 flex items-center h-[74px]">
            <button className="md:hidden p-2 mr-2" onClick={onMenuClick}>
                <MenuIcon />
            </button>
            <h1 className="text-xl font-semibold">Чат-помічник - Система підтримки рішень</h1>
        </header>
    );
}
