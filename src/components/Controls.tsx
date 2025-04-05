import React from 'react'

interface ControlsProps {
  onThrustDown: () => void
  onThrustUp: () => void
  onRotateLeftDown: () => void
  onRotateLeftUp: () => void
  onRotateRightDown: () => void
  onRotateRightUp: () => void
}

const Controls: React.FC<ControlsProps> = ({
  onThrustDown,
  onThrustUp,
  onRotateLeftDown,
  onRotateLeftUp,
  onRotateRightDown,
  onRotateRightUp,
}) => {
  return (
    <div className="controls">
      <button
        className="control-btn left"
        onMouseDown={onRotateLeftDown}
        onMouseUp={onRotateLeftUp}
        onTouchStart={onRotateLeftDown}
        onTouchEnd={onRotateLeftUp}
      >
        ↑
      </button>
      <button
        className="control-btn"
        onMouseDown={onThrustDown}
        onMouseUp={onThrustUp}
        onTouchStart={onThrustDown}
        onTouchEnd={onThrustUp}
      >
        ↑
      </button>
      <button
        className="control-btn right"
        onMouseDown={onRotateRightDown}
        onMouseUp={onRotateRightUp}
        onTouchStart={onRotateRightDown}
        onTouchEnd={onRotateRightUp}
      >
        ↑
      </button>
    </div>
  )
}

export default Controls
