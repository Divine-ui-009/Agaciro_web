interface StatCardProps {
    title: string;
    value: string | number;
    onClick?: () => void;
}

const StatCard = ({ title, value, onClick }: StatCardProps) => {
    return (
        <div 
            onClick={onClick}
            className={`bg-white rounded-2xl shadow-md p-6 cursor-pointer
                hover:shadow-lg hover:scale-[1.02] transition`}
        >
            <p className="text-gray-500 text-sm">{title}</p>
            <h2 className="text-3xl font-bold mt-2">{value}</h2>
            <p className="text-xs text-gray-400 mt-2">Click to view details</p>
        </div>
    );
};

export default StatCard;
