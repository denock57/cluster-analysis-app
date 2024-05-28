import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [algorithm, setAlgorithm] = useState('kmeans');
  const [clusters, setClusters] = useState(3);
  const [plotData, setPlotData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleAlgorithmChange = (event) => {
    setAlgorithm(event.target.value);
  };

  const handleClustersChange = (event) => {
    setClusters(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('algorithm', algorithm);
    formData.append('n_clusters', clusters);
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/cluster', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setPlotData({
        x: response.data.map(d => d[Object.keys(d)[0]]),
        y: response.data.map(d => d[Object.keys(d)[1]]),
        type: 'scatter',
        mode: 'markers',
        marker: {color: response.data.map(d => d.cluster)},
      });
      setLoading(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Cluster Analysis</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <select value={algorithm} onChange={handleAlgorithmChange}>
          <option value="kmeans">KMeans Clustering</option>
          <option value="hierarchical">Hierarchical Clustering</option>
          <option value="dbscan">DBSCAN Clustering</option>
        </select>
        <p>Select the number of clusters:</p>
        <input type="number" value={clusters} onChange={handleClustersChange} min="1" max="10" />
        <button type="submit">Analyze</button>
      </form>
      {loading && <p>Loading...</p>}
      {plotData && <div className="plot-container"><Plot data={[plotData]} layout={{ width: 700, height: 500, title: 'Cluster Result' }} /></div>}
    </div>
  );
}

export default App;
