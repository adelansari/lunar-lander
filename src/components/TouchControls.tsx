const TouchControls = ({ onControl }: {
    onControl: (key: string, pressed: boolean) => void
}) => {
    return (
        <div className="controls">
            <button
                className="control-btn left"
                onTouchStart={() => onControl('ArrowLeft', true)}
                onTouchEnd={() => onControl('ArrowLeft', false)}
                onMouseDown={() => onControl('ArrowLeft', true)}
                onMouseUp={() => onControl('ArrowLeft', false)}
            >↑</button>

            <button
                className="control-btn"
                onTouchStart={() => onControl('ArrowUp', true)}
                onTouchEnd={() => onControl('ArrowUp', false)}
                onMouseDown={() => onControl('ArrowUp', true)}
                onMouseUp={() => onControl('ArrowUp', false)}
            >↑</button>

            <button
                className="control-btn right"
                onTouchStart={() => onControl('ArrowRight', true)}
                onTouchEnd={() => onControl('ArrowRight', false)}
                onMouseDown={() => onControl('ArrowRight', true)}
                onMouseUp={() => onControl('ArrowRight', false)}
            >↑</button>
        </div>
    );
};

export default TouchControls;