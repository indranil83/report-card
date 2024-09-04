import React, { useEffect, useState, useRef } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Bar, Pie } from "react-chartjs-2";
import html2canvas from "html2canvas";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const App = () => {
  const [data, setData] = useState([]);
  const barChartRef = useRef();
  const pieChartRef = useRef();

  useEffect(() => {
    fetch("https://dummyjson.com/products")
      .then((res) => res.json())
      .then((data) => {
        setData(data.products);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);


  const groupByCategory = (data) => {
    const groupedData = {};

    data.forEach((item) => {
      if (groupedData[item.category]) {
        groupedData[item.category] += item.price;
      } else {
        groupedData[item.category] = item.price;
      }
    });

    return groupedData;
  };

  const groupedData = groupByCategory(data);

  const barChartData = {
    labels: data.map((item) => item.title),
    datasets: [
      {
        label: "Product Price",
        data: data.map((item) => item.price),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const pieChartData = {
    labels: Object.keys(groupedData),
    datasets: [
      {
        label: "Product Categories",
        data: Object.values(groupedData),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
        hoverBackgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
      },
    ],
  };

  const pieChartOptions = {
    plugins: {
      legend: {
        display: true,
        position: 'right',
        align: 'center',
      },
    },
  };

  const exportPdf = async () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [297, 210] });


    const logoUrl = `${process.env.PUBLIC_URL}/golden2.png.png`;


    const logoImage = await loadImage(logoUrl);

    drawPageBorder(doc);
    const logoWidth = 33;
    const logoHeight = 22;
    doc.addImage(logoImage, 'PNG', 10, 10, logoWidth, logoHeight);


    // const headerText = "Elogix";
    // doc.setFontSize(30);
    // doc.setFont("times", "italic");
    // doc.setTextColor('#eb3455');
    // const textX = 10 + 30 + 10;
    // doc.text(headerText, textX, 20);




    doc.setFontSize(20);
    doc.setFont("times", "italic");
    doc.setTextColor(128, 0, 128);
    const finalReportText = "Final Report";
    const finalReportWidth = doc.getTextWidth(finalReportText);
    const finalReportX = 297 - finalReportWidth - 10;
    const finalReportY = 20;
    doc.text(finalReportText, finalReportX, finalReportY);

    const underlineY = finalReportY + 3;
    doc.setLineWidth(0.3);
    doc.setDrawColor('#eb3455');
    doc.line(finalReportX, underlineY, finalReportX + finalReportWidth, underlineY);

    const printDate = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const printDateText = "Report created on: " + printDate.toLocaleDateString(undefined, options);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor('#3471eb');
    const printDateWidth = doc.getTextWidth(printDateText);
    doc.text(printDateText, 297 - printDateWidth - 10, 40);


    const scannedOnText = "Scanned on: " + printDate.toLocaleDateString(undefined, options);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor('#3471eb');
    const scannedOnWidth = doc.getTextWidth(scannedOnText);
    doc.text(scannedOnText, 297 - scannedOnWidth - 10, 30);


    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor('#3471eb');
    doc.text("Generated on: " + new Date().toLocaleDateString(), 10, 40);

    const lineY = 45;
    doc.setLineWidth(0.5);
    doc.setDrawColor('#eb8c34');
    doc.line(10, lineY, 297 - 10, lineY);

    const tableData = data.map((row) => [
      row.id,
      row.title,
      row.brand,
      row.category,
      `$${row.price}`,
      `${row.rating}/5`,
    ]);

    const tableStartY = 50;

    doc.autoTable({
      head: [["Id", "Title", "Brand", "Category", "Price", "Rating"]],
      body: tableData,
      startY: tableStartY,
      theme: 'striped',
      columnStyles: {
        0: { fillColor: [172, 157, 230], halign: 'center' },
      },
      styles: {
        fontSize: 10,
        overflow: 'linebreak',
        halign: 'center',
        valign: 'middle',
        lineWidth: 0.5,
        lineColor: [0, 0, 0]
      },
      headStyles: {
        fillColor: [0, 102, 204]
      },
      margin: { top: tableStartY + 10 },
    });

    drawPageBorder(doc);
    doc.addPage();
    drawPageBorder(doc);

    const chartStartY = 10;

    const barChartElement = barChartRef.current;
    const pieChartElement = pieChartRef.current;

    if (barChartElement && pieChartElement) {
      const barChartImage = await html2canvas(barChartElement, { scale: 2 });
      const barImgData = barChartImage.toDataURL("image/png");

      const pieChartImage = await html2canvas(pieChartElement, { scale: 2 });
      const pieImgData = pieChartImage.toDataURL("image/png");


      doc.addImage(barImgData, "PNG", 10, chartStartY, 140, 100);
      doc.addImage(pieImgData, "PNG", 160, chartStartY, 140, 95);
    }

    drawPageBorder(doc);

    doc.setFontSize(10);
    doc.text("Page 1", 280, 200, { align: 'right' });

    doc.save("full-report.pdf");
  };


  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = url;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  };
  const drawPageBorder = (doc) => {
    doc.setDrawColor('#eb3434');
    doc.setLineWidth(0.5);
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
  };

  return (
    <div style={{ padding: "30px" }}>
      <button className="btn btn-success float-end mt-2 mb-2" onClick={exportPdf}>
        Download PDF
      </button>

      <h3>Table Data:</h3>
      <table className="table table-bordered table-hover" id="my-table">
        <thead className="table-dark ">
          <tr>
            <th scope="col">Id</th>
            <th scope="col">Title</th>
            <th scope="col">Brand</th>
            <th scope="col">Category</th>
            <th scope="col">Price</th>
            <th scope="col">Rating</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.title}</td>
              <td>{row.brand}</td>
              <td>{row.category}</td>
              <td>${row.price}</td>
              <td>{row.rating}/5</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px", gap: "10px" }}>
        <div ref={barChartRef} style={{ width: "400px", height: "300px" }}>
          <Bar data={barChartData} />
        </div>

        <div ref={pieChartRef} style={{ width: "400px", height: "300px" }}>
          <Pie data={pieChartData} options={pieChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default App;
