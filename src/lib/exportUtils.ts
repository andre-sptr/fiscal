import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  category: string;
  date: string;
  description?: string | null;
}

export const exportToCSV = (transactions: Transaction[], formatter: (amount: number) => string, filename?: string) => {
  const headers = ['Tanggal', 'Kategori', 'Deskripsi', 'Tipe', 'Jumlah'];

  const rows = transactions.map(t => [
    format(new Date(t.date), 'dd MMM yyyy', { locale: id }),
    t.category,
    t.description || '-',
    t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    t.type === 'income' ? formatter(t.amount) : `-${formatter(t.amount)}`,
  ]);

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  rows.push(['', '', '', '', '']);
  rows.push(['', '', '', 'Total Pemasukan', formatter(totalIncome)]);
  rows.push(['', '', '', 'Total Pengeluaran', `-${formatter(totalExpense)}`]);
  rows.push(['', '', '', 'Saldo', formatter(totalIncome - totalExpense)]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename || `fiscal-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (
  transactions: Transaction[],
  monthlyIncome: number,
  monthlyExpense: number,
  totalBalance: number,
  formatter: (amount: number) => string,
  filename?: string
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(13, 148, 136); // Primary teal color
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Fiscal', 20, 25);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Laporan Keuangan - ${format(new Date(), 'MMMM yyyy', { locale: id })}`, 20, 33);

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Summary section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Ringkasan Keuangan', 20, 55);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Summary boxes
  const summaryY = 62;
  const boxWidth = 55;
  const boxHeight = 25;

  // Total Balance
  doc.setFillColor(240, 253, 250);
  doc.roundedRect(20, summaryY, boxWidth, boxHeight, 3, 3, 'F');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Total Saldo', 25, summaryY + 8);
  doc.setFontSize(11);
  doc.setTextColor(13, 148, 136);
  doc.setFont('helvetica', 'bold');
  doc.text(formatter(totalBalance), 25, summaryY + 18);

  // Income
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(80, summaryY, boxWidth, boxHeight, 3, 3, 'F');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('Pemasukan Bulan Ini', 85, summaryY + 8);
  doc.setFontSize(11);
  doc.setTextColor(34, 197, 94);
  doc.setFont('helvetica', 'bold');
  doc.text(formatter(monthlyIncome), 85, summaryY + 18);

  // Expense
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(140, summaryY, boxWidth, boxHeight, 3, 3, 'F');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('Pengeluaran Bulan Ini', 145, summaryY + 8);
  doc.setFontSize(11);
  doc.setTextColor(239, 68, 68);
  doc.setFont('helvetica', 'bold');
  doc.text(formatter(monthlyExpense), 145, summaryY + 18);

  // Transaction table
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Riwayat Transaksi', 20, 100);

  const tableData = transactions.map(t => [
    format(new Date(t.date), 'dd MMM yyyy', { locale: id }),
    t.category,
    t.description || '-',
    t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    t.type === 'income' ? `+${formatter(t.amount)}` : `-${formatter(t.amount)}`,
  ]);

  autoTable(doc, {
    startY: 105,
    head: [['Tanggal', 'Kategori', 'Deskripsi', 'Tipe', 'Jumlah']],
    body: tableData,
    headStyles: {
      fillColor: [13, 148, 136],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 35 },
      2: { cellWidth: 50 },
      3: { cellWidth: 25 },
      4: { cellWidth: 35, halign: 'right' },
    },
    margin: { left: 20, right: 20 },
    didParseCell: (data) => {
      // Color amount column based on type
      if (data.column.index === 4 && data.section === 'body') {
        const value = data.cell.raw as string;
        if (value.startsWith('+')) {
          data.cell.styles.textColor = [34, 197, 94];
        } else if (value.startsWith('-')) {
          data.cell.styles.textColor = [239, 68, 68];
        }
      }
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Dibuat oleh Fiscal - ${format(new Date(), 'dd MMMM yyyy HH:mm', { locale: id })}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(filename || `fiscal-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
