import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import './CSS/Legend.css';

function Legend() {
  const map = useMap();

  const getColor = (status) => {
    if (status === 'Low') return '#ADD8E6';
    else if (status === 'Moderate') return '#FFFF00';
    else if (status === 'Good') return '#90EE90';
    else if (status === 'High') return '#FF0000';
    else return '#FFFFFF';
  };

  const legend = L.control({ position: 'bottomright' });

  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'info legend');
    const status = ['Low', 'Moderate', 'Good', 'High'];

    for (let i = 0; i < status.length; i++) {
      div.innerHTML +=
        '<i style="background:' +
        getColor(status[i]) +
        '"></i> ' +
        status[i] +
        '<br />';
    }

    return div;
  };

  useEffect(() => {
    legend.addTo(map);

    return () => {
      legend.remove();
    };
  }, [map]);

  return null;
}

export default Legend;