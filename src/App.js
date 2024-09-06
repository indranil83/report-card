import React, { useEffect, useState, useRef } from "react";
import { format } from 'date-fns';
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
  const radarChartData = {
    labels: data.map((item) => item.title),
    datasets: [
      {
        label: "Product Ratings",
        data: data.map((item) => item.rating),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
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

    const margin = 10; 

    const drawLineBelowTable = (doc, y) => {
      if (typeof y === 'number' && !isNaN(y)) {
        doc.setLineWidth(0.5);
        doc.setDrawColor('#4c9dba');
        doc.line(10, y + 10, 297 - 10, y + 10); 
      } else {
        console.error("Invalid Y coordinate for line.");
      } 
    };
    const logoUrl = `${process.env.PUBLIC_URL}/golden2.png.png`;
    const logoImage = await loadImage(logoUrl);
    const logoWidth = 33;
    const logoHeight = 22;
    const logoX = 10;
    const logoY = 5;

    const addHeader = (doc) => {
      doc.addImage(logoImage, 'PNG', logoX, logoY, logoWidth, logoHeight);
      doc.setFontSize(20);
      doc.setFont("italic");
      doc.setTextColor('#549d9e');
      const companyName = "Elogix Report";
      const pageWidth = doc.internal.pageSize.width;
      const companyNameWidth = doc.getTextWidth(companyName);
      const companyNameX = pageWidth - companyNameWidth - 10;
      const companyNameY = logoY + 14;
      doc.text(companyName, companyNameX, companyNameY);


      const lineY = logoY + logoHeight + 1; 
      doc.setLineWidth(0.5);
      doc.setDrawColor('#549d9e');
      doc.line(logoX, lineY, 297 - 10, lineY);
    };



    doc.addImage(logoImage, 'PNG', logoX, logoY, logoWidth, logoHeight);
    doc.setFontSize(20);
    doc.setFont("italic");
    doc.setTextColor('#549d9e');
    const companyName = "Elogix Report";
    const pageWidth = doc.internal.pageSize.width;
    const companyNameWidth = doc.getTextWidth(companyName);
    const companyNameX = pageWidth - companyNameWidth - 10;
    const companyNameY = logoY + 14; 
    doc.text(companyName, companyNameX, companyNameY);

   
    const lineY = logoY + logoHeight + 1;
    doc.setLineWidth(0.5);
    doc.setDrawColor('#4c9dba'); 
    doc.line(logoX, lineY, 297 - 10, lineY);

   
    const printDate = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const printDateText = "Report created on: " + printDate.toLocaleDateString(undefined, options);
    const scannedOnText = "Scanned on: " + format(printDate, 'h:mm:ss a');

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(128, 0, 128);

    const printDateWidth = doc.getTextWidth(printDateText);
    const scannedOnWidth = doc.getTextWidth(scannedOnText);
    const textStartX = 297 - Math.max(printDateWidth, scannedOnWidth) - 10; 

    doc.text(printDateText, textStartX, lineY + 6); 
    doc.text(scannedOnText, textStartX, lineY + 12); 
   
    doc.setFontSize(25);
    doc.setFont("times", "italic");
    doc.setTextColor(128, 0, 128);
    const finalReportText = "Final Report";
    const finalReportWidth = doc.getTextWidth(finalReportText);
    const finalReportX = (pageWidth - finalReportWidth) / 2; 
    const finalReportY = lineY + 10; 
    doc.text(finalReportText, finalReportX, finalReportY);


    
    const separationLineY = finalReportY + 5; 
    doc.setLineWidth(0.5); 
    doc.setDrawColor('#4c9dba');
    doc.line(10, separationLineY, 297 - 10, separationLineY);

    const reportDescTitle = "Report Description:";
    const reportDescFontSize = 10;
    doc.setFontSize(reportDescFontSize);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(128, 0, 128); 
    const reportDescWidth = doc.getTextWidth(reportDescTitle);
    const reportDescX = 10; 
    const reportDescY = lineY + 7; 

    doc.text(reportDescTitle, reportDescX, reportDescY);



    const loremText = `Lorem ipsum dolor sit amet.Ut enim ad minim veniam.`;

    const loremFontSize = 9;
    doc.setFontSize(loremFontSize);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); 

    const loremX = reportDescX + doc.getTextWidth(reportDescTitle) + 8;
    const loremY = reportDescY;

    doc.text(loremText, loremX, loremY, { maxWidth: pageWidth - loremX - 10 });


    
    const tableStartY = separationLineY + 6; 

    const tableData = data.map((row) => [
      row.id,
      row.title,
      row.title,
      row.title,
      row.brand,
      row.category,
      `$${row.price}`,
      `${row.rating}/5`,
      `$${row.price}`,
      `${row.rating}/5`,
      `$${row.price}`,
      `${row.rating}/5`,
      row.reviewerName || "N/A",
    ]);

    doc.autoTable({
      head: [["Id", "Title", "Title", "Title", "Brand", "Category", "Price", "Rating", "Price", "Rating", "Price", "Rating", "reviewerName"]],
      body: tableData,
      startY: tableStartY,
      theme: 'grid',
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { cellWidth: 30 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 30 }
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
        fillColor: ['#71407a']
      },
      margin: { top: tableStartY + 10 },
      didDrawPage: (data) => {
        drawPageBorder(doc);
        const tableY = doc.autoTable.previous.finalY; 
        drawLineBelowTable(doc, tableY);
        addHeader(doc);
      },
    });

    const lineBelowTableY = doc.autoTable.previous.finalY + 10;
    doc.setLineWidth(0.5);
    doc.setDrawColor('#4c9dba');
    doc.line(10, lineBelowTableY, 297 - 10, lineBelowTableY);

    doc.addPage();

    const chartStartY = margin;

    const barChartElement = barChartRef.current;
    const pieChartElement = pieChartRef.current;

    if (barChartElement && pieChartElement) {
      const barChartImage = await html2canvas(barChartElement, { scale: 2 });
      const barImgData = barChartImage.toDataURL("image/png");

      const pieChartImage = await html2canvas(pieChartElement, { scale: 2 });
      const pieImgData = pieChartImage.toDataURL("image/png");
      const barChartOffset = 12; 

      const pieChartOffsetX = 9;
      doc.addImage(barImgData, "PNG", margin, chartStartY + 40+ barChartOffset, 140, 100);
      doc.addImage(pieImgData, "PNG", margin+150+ pieChartOffsetX, chartStartY + 30, 140, 95);
    }

    const addWatermarkAndPageNumbers = () => {
      const watermarkText = "Powered by Elogix";
      const watermarkFontSize = 9;
      const watermarkX = margin;
      const watermarkOffset = 10;
      const totalPages = doc.internal.getNumberOfPages();
    
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const lineBelowTableY = doc.autoTable.previous.finalY + 6; 
    
        doc.setFontSize(watermarkFontSize);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(150, 150, 150); 
        const watermarkY = lineBelowTableY + watermarkOffset; 
        doc.text(watermarkText, watermarkX, watermarkY);
    
        doc.setFontSize(10);
        const pageCountText = `Page ${i} of ${totalPages}`;
        const pageCountX = 297 - margin; 
        const pageCountY = lineBelowTableY + watermarkOffset;
        doc.text(pageCountText, pageCountX, pageCountY, { align: 'right' });
      }
    };
    addWatermarkAndPageNumbers();
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      const tableY = doc.autoTable.previous.finalY; 
      drawLineBelowTable(doc, tableY);
      drawPageBorder(doc);
    }
    doc.setPage(doc.internal.getNumberOfPages());
    addHeader(doc);

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
    doc.setDrawColor('#4c9dba');
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
            <th scope="col">Title</th>
            <th scope="col">Title</th>
            <th scope="col">Brand</th>
            <th scope="col">Category</th>
            <th scope="col">Price</th>
            <th scope="col">Rating</th>
            <th scope="col">Price</th>
            <th scope="col">Rating</th>
            <th scope="col">Price</th>
            <th scope="col">Rating</th>
            <th scope="col">reviewerName</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.title}</td>
              <td>{row.title}</td>
              <td>{row.title}</td>
              <td>{row.brand}</td>
              <td>{row.category}</td>
              <td>${row.price}</td>
              <td>{row.rating}/5</td>
              <td>${row.price}</td>
              <td>{row.rating}/5</td>
              <td>${row.price}</td>
              <td>{row.rating}/5</td>
              <td>{row.reviewerName || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px", gap: "10px" }}>
        <div ref={barChartRef} style={{ width: "400px", height: "300px", marginTop: "20px" }}>
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