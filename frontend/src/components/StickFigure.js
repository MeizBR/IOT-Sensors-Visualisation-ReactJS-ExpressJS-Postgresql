const StickFigure = ({ measureType, value }) => {

    const checkValueStatus = (x, y) => {
        let color = '';
        switch (x) {
            case 'Temperature':
              if (y <= 12)
                color += 'lightblue';
              else if (y > 12 && y <= 22)
                color += 'yellow';
              else if (y > 22 && y <= 28)
                color += 'lightgreen';
              else
                color += 'red';
              break;
          
            case 'CO2':
              if (y <= 5)
                color += 'lightblue';
              else if (y > 5 && y <= 10)
                color += 'yellow';
              else if (y > 10 && y <= 15)
                color += 'lightgreen';
              else
                color += 'red';
              break;
          
            default:
              if (y <= 3)
                color += 'lightblue';
              else if (y > 3 && y <= 8)
                color += 'yellow';
              else if (y > 8 && y <= 12)
                color += 'lightgreen';
              else
                color += 'red';
              break;
        }
        
        return color;
    }


    const stickStyle = {
      width: '7px',
      height: '40px',
      margin: '0 auto',
      background: 'white',
      border: '2px solid black',
      borderRadius: '3px',
    };
  
    const rectangleStyle = {
      width: '60px',
      height: '30px',
      background: checkValueStatus(measureType, value),
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      border: '3px solid black',
      borderRadius: '10px',
      margin: '0 auto',
      fontSize: '20px',
      fontWeight: 'bold'
    };

  
    return (
      <div>
        <div style={rectangleStyle}>{value}</div>
        <div style={stickStyle}></div>
      </div>
    );
  };

  export default StickFigure;