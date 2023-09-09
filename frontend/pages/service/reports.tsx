import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from 'context/AuthContext';
import { useRouter } from 'next/router';
import {
    TableBody,
    TableContainer,
    Table,
    TableHeader,
    TableCell,
    TableRow,
    TableFooter,
    Avatar,
    Badge,
    Pagination,
    Input,
    Button,
    ModalBody,
    ModalHeader,
    Modal,
    Select,
    Label
  } from '@roketid/windmill-react-ui'
import Layout from 'example/containers/Layout';
import PageTitle from 'example/components/Typography/PageTitle';
import SectionTitle from 'example/components/Typography/SectionTitle';
import MemberReport from 'example/components/Reports/MemberReport';
import { FormsIcon } from 'icons';
import IncomeVoucherReportForm from 'example/components/Reports/IncomeVouchersReport';
import IncomeVoucherReport from 'example/components/Reports/IncomeVouchersReport';
import IncomeVouchersReportForm from 'example/components/Reports/IncomeVouchersReport';
import IncomeVouchersReport from 'example/components/Reports/IncomeVouchersReport';
import ExpenseVouchersReport from 'example/components/Reports/ExpenseVouchersReport';
import DuesPaidReport from 'example/components/Reports/DuesPaidReport';
import DuesUnpaidReport from 'example/components/Reports/DuesUnpaidReport';
import DuesCancelledReport from 'example/components/Reports/DuesCancelledReport';

const ReportsHome = () => {
    const { accessToken, loginLoading } = useAuth();
    const router = useRouter();

    const REPORT_TYPE_WIDTH = "450px";
    const REPORT_CONTAINS_WIDTH = "500px";
    const REPORT_NOT_CONTAINS_WIDTH = "100px";
    const GENERATE_REPORT_WIDTH = "150px";

    const [showMemberReport, setShowMemberReport] = useState(false);
    const [showIncomeVouchersReport, setShowIncomeVouchersReport] = useState(false);
    const [showExpenseVouchersReport, setShowExpenseVouchersReport] = useState(false);
    const [showDuesPaidReport, setShowDuesPaidReport] = useState(false);
    const [showDuesUnpaidReport, setShowDuesUnpaidReport] = useState(false);
    const [showDuesCancelledReport, setShowDuesCancelledReport] = useState(false);
    

  const [isModalOpen, setIsModalOpen] = useState(false)
  

  const [rtype, setRtype] = useState("MembersList");
  const [rfilter, setRfilter] = useState("All");
  const [rward, setRward] = useState("All");

  function openModal() {
    setIsModalOpen(true)
    }

   function closeModal() {
    setIsModalOpen(false)
    }

  // Inactive Members Report
  const GenerateInactiveMembersReport = () => {
    const config = {
      method: 'get',
      url: process.env.NEXT_PUBLIC_BACKEND_URL+'/api/reports/inactive-members/',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      responseType: 'blob'  // <-- This is important
  };
    
  axios.request(config)
  .then(response => {
      console.log(response.data);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `InactiveMembersReport.xlsx`);
      document.body.appendChild(link);
      link.click();
  });
};

  // Minor To Major Report
  const GenerateMinorToMajorReport = () => {
    const config = {
      method: 'get',
      url: process.env.NEXT_PUBLIC_BACKEND_URL+'/api/reports/minor-to-major/',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      responseType: 'blob'  // <-- This is important
  };
    
  axios.request(config)
  .then(response => {
      console.log(response.data);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `MinorToMajorReport.xlsx`);
      document.body.appendChild(link);
      link.click();
  });
};

  // Pending Dues With Fines Reports 
  const GeneratePendingDuesWithFinesReport = () => {
    const config = {
      method: 'get',
      url: process.env.NEXT_PUBLIC_BACKEND_URL+'/api/reports/get-pending-dues/',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      responseType: 'blob'  // <-- This is important
  };
    
  axios.request(config)
  .then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `KudishikaWithFinesReport.xlsx`);
      document.body.appendChild(link);
      link.click();
  });
};

  // Pending Dues Without Fines Report 
  const GeneratePendingDuesWithoutFinesReport = () => {
    const config = {
      method: 'get',
      url: process.env.NEXT_PUBLIC_BACKEND_URL+'/api/reports/gget-pending-dues-without-fines/',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      responseType: 'blob'  // <-- This is important
  };
    
  axios.request(config)
  .then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `KudishikaWithoutFinesReport.xlsx`);
      document.body.appendChild(link);
      link.click();
  });
};

useEffect(() => {
  if (!loginLoading && !accessToken){
    router.push('/login/');
  }
}, [accessToken]);

  return (
    <Layout>
    <PageTitle>Reports</PageTitle>
    <SectionTitle>Member Reports</SectionTitle>
    <div className="flex flex-col flex-wrap mb-8 space-y-4 md:flex-row md:items-end md:space-x-4">
        <TableContainer>
            <Table>
            <TableHeader>
                            <TableCell style={{ width: REPORT_TYPE_WIDTH }}>Report Type</TableCell>
                            <TableCell style={{ width: REPORT_CONTAINS_WIDTH }}>Report Contains</TableCell>
                            <TableCell style={{ width: REPORT_NOT_CONTAINS_WIDTH }}>Report Does Not Contain</TableCell>
                            <TableCell style={{ width: GENERATE_REPORT_WIDTH }}>Generate Report</TableCell>
                        </TableHeader>
                <TableBody>   
                  <TableRow>
                    <TableCell style={{ whiteSpace: 'normal' }}>Members Report</TableCell>
                    <TableCell style={{ whiteSpace: 'normal' }}>Information Related To Active Members</TableCell>
                    <TableCell style={{ whiteSpace: 'normal' }}>Contact Info, Inactive Members</TableCell>
                    <TableCell style={{ whiteSpace: 'normal' }}><Button iconRight={FormsIcon} 
                    onClick={() => {
                      setShowMemberReport(true);
                      setShowIncomeVouchersReport(false);
                      setShowExpenseVouchersReport(false);
                      setShowDuesPaidReport(false);
                      setShowDuesUnpaidReport(false);
                      setShowDuesCancelledReport(false);
                      openModal();
                    }}>Generate</Button></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ whiteSpace: 'normal' }}>Inactive Members Report</TableCell>
                    <TableCell style={{ whiteSpace: 'normal' }}>Information Related To Inactive Members</TableCell>
                    <TableCell style={{ whiteSpace: 'normal' }}>Inactive Members</TableCell>
                    <TableCell style={{ whiteSpace: 'normal' }}><Button iconRight={FormsIcon} onClick={GenerateInactiveMembersReport}>Generate</Button></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ whiteSpace: 'normal' }}>Minor To Major Report</TableCell>
                    <TableCell style={{ whiteSpace: 'normal' }}>Minors Turing 18 (Adult Age) During The FY</TableCell>
                    <TableCell style={{ whiteSpace: 'normal' }}>-</TableCell>
                    <TableCell style={{ whiteSpace: 'normal' }}><Button iconRight={FormsIcon} onClick={GenerateMinorToMajorReport}>Generate</Button></TableCell>
                  </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    </div>
        <SectionTitle>Income Expense Reports</SectionTitle>
        <div className="flex flex-col flex-wrap mb-8 space-y-4 md:flex-row md:items-end md:space-x-4">
        <TableContainer>
          <Table>
          <TableHeader>
                  <TableCell style={{ width: REPORT_TYPE_WIDTH }}>Report Type</TableCell>
                  <TableCell style={{ width: REPORT_CONTAINS_WIDTH }}>Report Contains</TableCell>
                  <TableCell style={{ width: REPORT_NOT_CONTAINS_WIDTH }}>Report Does Not Contain</TableCell>
                  <TableCell style={{ width: GENERATE_REPORT_WIDTH }}>Generate Report</TableCell>
                </TableHeader>
                <TableBody>   
                  <TableRow>
                    <TableCell style={{ whiteSpace: 'normal' }}>Income Vouchers Report</TableCell>
                    <TableCell style={{ whiteSpace: 'normal' }}>Income Vouchers (Annual/Custom)</TableCell>
                    <TableCell style={{ whiteSpace: 'normal' }}>-</TableCell>
                    <TableCell style={{ whiteSpace: 'normal' }}><Button iconRight={FormsIcon} 
                    onClick={() => {
                      setShowMemberReport(false);
                      setShowIncomeVouchersReport(true);
                      setShowExpenseVouchersReport(false);
                      setShowDuesPaidReport(false);
                      setShowDuesUnpaidReport(false);
                      setShowDuesCancelledReport(false);
                      openModal();
                      }}>Generate</Button></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ whiteSpace: 'normal' }}>Expense Vouchers Report</TableCell>
                    <TableCell style={{ whiteSpace: 'normal' }}>Expense Vouchers (Annual/Custom)</TableCell>
                    <TableCell style={{ whiteSpace: 'normal' }}>-</TableCell>
                    <TableCell style={{ whiteSpace: 'normal' }}><Button iconRight={FormsIcon} 
                    onClick={() => {
                      setShowMemberReport(false);
                      setShowIncomeVouchersReport(false);
                      setShowExpenseVouchersReport(true);
                      setShowDuesPaidReport(false);
                      setShowDuesUnpaidReport(false);
                      setShowDuesCancelledReport(false);
                      openModal();
                      }}>Generate</Button></TableCell>
                  </TableRow>
                  </TableBody>
                  </Table>
                  </TableContainer>
                  </div>
                  <SectionTitle>Dues Reports</SectionTitle>
        <div className="flex flex-col flex-wrap mb-8 space-y-4 md:flex-row md:items-end md:space-x-4">
        <TableContainer>
          <Table>
          <TableHeader>
                            <TableCell style={{ width: REPORT_TYPE_WIDTH }}>Report Type</TableCell>
                            <TableCell style={{ width: REPORT_CONTAINS_WIDTH }}>Report Contains</TableCell>
                            <TableCell style={{ width: REPORT_NOT_CONTAINS_WIDTH }}>Report Does Not Contain</TableCell>
                            <TableCell style={{ width: GENERATE_REPORT_WIDTH }}>Generate Report</TableCell>
                        </TableHeader>
                <TableBody>
                <TableRow>
                    <TableCell style={{ whiteSpace: 'normal' }}>Pending Dues Report (With Fines)</TableCell>
                    <TableCell style={{ whiteSpace: 'normal' }}>Pending Dues Totals Memberwise With Fines</TableCell>
                    <TableCell style={{ whiteSpace: 'normal' }}>Breakup Of Total Owed</TableCell>
                    <TableCell style={{ whiteSpace: 'normal' }}><Button iconRight={FormsIcon} onClick={GeneratePendingDuesWithFinesReport}>Generate</Button></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ whiteSpace: 'normal' }}>Pending Dues Report (Without Fines)</TableCell>
                    <TableCell style={{ whiteSpace: 'normal' }}>Pending Dues Totals By Memberwise w/o Fines</TableCell>
                    <TableCell style={{ whiteSpace: 'normal' }}>Breakup Of Total Owed</TableCell>
                    <TableCell style={{ whiteSpace: 'normal' }}><Button iconRight={FormsIcon} onClick={GeneratePendingDuesWithoutFinesReport}>Generate</Button></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ whiteSpace: 'normal' }}>Dues Paid Report</TableCell>
                    <TableCell style={{ whiteSpace: 'normal' }}>Due Amounts Paid Memberwise (Annual/Custom)</TableCell>
                    <TableCell style={{ whiteSpace: 'normal' }}>Fines</TableCell>
                    <TableCell style={{ whiteSpace: 'normal' }}><Button iconRight={FormsIcon} 
                    onClick={() => {
                      setShowMemberReport(false);
                      setShowIncomeVouchersReport(false);
                      setShowExpenseVouchersReport(false);
                      setShowDuesPaidReport(true);
                      setShowDuesUnpaidReport(false);
                      setShowDuesCancelledReport(false);
                      openModal();
                      }}>Generate</Button></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ whiteSpace: 'normal' }}>Dues Unpaid Report</TableCell>
                    <TableCell style={{ whiteSpace: 'normal' }}>Due Amounts Unpaid Memberwise (Annual/Custom)</TableCell>
                    <TableCell style={{ whiteSpace: 'normal' }}>Fines</TableCell>
                    <TableCell style={{ whiteSpace: 'normal' }}><Button iconRight={FormsIcon} 
                    onClick={() => {
                      setShowMemberReport(false);
                      setShowIncomeVouchersReport(false);
                      setShowExpenseVouchersReport(false);
                      setShowDuesPaidReport(false);
                      setShowDuesUnpaidReport(true);
                      setShowDuesCancelledReport(false);
                      openModal();
                      }}>Generate</Button></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ whiteSpace: 'normal' }}>Dues Cancelled Report</TableCell>
                    <TableCell style={{ whiteSpace: 'normal' }}>Due Amounts Cancelled Memberwise (Annual/Custom)</TableCell>
                    <TableCell style={{ whiteSpace: 'normal' }}>Fines</TableCell>
                    <TableCell style={{ whiteSpace: 'normal' }}><Button iconRight={FormsIcon} 
                    onClick={() => {
                      setShowMemberReport(false);
                      setShowIncomeVouchersReport(false);
                      setShowExpenseVouchersReport(false);
                      setShowDuesPaidReport(false);
                      setShowDuesUnpaidReport(false);
                      setShowDuesCancelledReport(true);
                      openModal();
                      }}>Generate</Button></TableCell>
                  </TableRow>
                </TableBody>
            </Table>
        </TableContainer> 
    </div>
    <SectionTitle>Custom Reports</SectionTitle>
        <div className="flex flex-col flex-wrap mb-8 space-y-4 md:flex-row md:items-end md:space-x-4">
        <TableContainer>
          <Table>
          <TableHeader>
            <TableCell style={{ width: REPORT_TYPE_WIDTH }}>Report Type</TableCell>
            <TableCell style={{ width: REPORT_CONTAINS_WIDTH }}>Report Contains</TableCell>
            <TableCell style={{ width: REPORT_NOT_CONTAINS_WIDTH }}>Report Does Not Contain</TableCell>
            <TableCell style={{ width: GENERATE_REPORT_WIDTH }}>Generate Report</TableCell>
        </TableHeader>
                <TableBody>
                <TableRow>
                  <TableCell style={{ whiteSpace: 'normal' }}>Custom Reports</TableCell>
                  <TableCell style={{ whiteSpace: 'normal' }}>Generate Reports With SQL</TableCell>
                  <TableCell style={{ whiteSpace: 'normal' }}>N/A</TableCell>
                  <TableCell style={{ whiteSpace: 'normal' }}><Button iconRight={FormsIcon} disabled>Generate</Button></TableCell>
                </TableRow>
                </TableBody>
                </Table>
                </TableContainer>
                </div>


    <Modal isOpen={isModalOpen} onClose={closeModal}>
  <ModalBody>
    {showMemberReport && (
      <MemberReport />
    )}
    {showIncomeVouchersReport && (
      <IncomeVouchersReport />
    )}
    {showExpenseVouchersReport && (
      <ExpenseVouchersReport />
    )}
    {showDuesPaidReport && (
      <DuesPaidReport />
    )}
    {showDuesUnpaidReport && (
      <DuesUnpaidReport />
    )}
    {showDuesCancelledReport && (
      <DuesCancelledReport />
    )}
    
  </ModalBody>
</Modal>

    </Layout>
  );
};

export default ReportsHome;
