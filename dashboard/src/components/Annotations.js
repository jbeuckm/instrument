import { useState } from 'react'
import { AnnotationLabel } from 'react-annotation'

const Annotations = ({ annotations, scale }) => {
  const [props, setProps] = useState({
    x: 10,
    y: 10,
    dy: 50,
    dx: 50,
  })

  return annotations.map((annotation) => {
    return (
      <AnnotationLabel
        x={scale.x(annotation._x)}
        y={scale.y(annotation._y)}
        dx={props.dx}
        dy={props.dy}
        color={'#333'}
        editMode={true}
        note={{
          title: 'Annotations :)',
          label: 'Longer text to show text wrapping',
          align: 'middle',
          orientation: 'topBottom',
          bgPadding: 10,
          padding: 10,
          titleColor: '#666',
        }}
        onDrag={(e) => setProps(e)}
      />
    )
  })
}

export default Annotations
