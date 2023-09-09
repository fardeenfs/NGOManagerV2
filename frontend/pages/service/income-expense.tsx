import React, { useState, useEffect } from 'react';
import axios from 'axios';
import IncomeVoucherForm from 'example/components/Vouchers/IncomeVoucherForm';
import { useAuth } from 'context/AuthContext';
import { useRouter } from 'next/router';
import Layout from 'example/containers/Layout';
import ExpenseVoucherForm from 'example/components/Vouchers/ExpenseVoucherForm';
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
  Modal
} from '@roketid/windmill-react-ui'
import { ChatIcon, EditIcon, FormsIcon, HeartIcon, MailIcon, PeopleIcon, TrashIcon } from 'icons';
import PageTitle from 'example/components/Typography/PageTitle';
import Link from 'next/link';
import { useConfig } from 'context/ConfigContext';


const IncomeExpense = () => {
  const { accessToken, loginLoading } = useAuth();
  const { currency, currencySymbol, setCurrency, timezone, setTimezone } = useConfig();
  const router = useRouter();

  const [voucherRecords, setVoucherRecords] = useState([]);

  const [showIncomeVoucher, setShowIncomeVoucher] = useState(false);
  const [showExpenseVoucher, setShowExpenseVoucher] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false)

  function formatCurrencyAmount(amount: Number) {
    return Number(amount).toLocaleString('en-IN', {
      style: 'currency',
      currency: currency,});
  }

  function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString(undefined, options);
    return formattedDate.split('/').join('-');
  }

  function openModal() {
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
  }

  useEffect(() => {
    if (accessToken) {  
    const config = {
      method: 'get',
      url: process.env.NEXT_PUBLIC_BACKEND_URL+`/api/vouchers/voucherrecords/`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
    console.log(config);
    axios.request(config)
    .then((response) => {
      console.log(response.data);
      setVoucherRecords(response.data);
    })
    .catch((err) => console.error(err));
  }

  if (!loginLoading && !accessToken){
    router.push('/login/');
  }
  }, [accessToken]);
  


  const cancelVoucher = async (voucherId) => {
    const config = {
      method: 'post',
      url: process.env.NEXT_PUBLIC_BACKEND_URL+`/api/vouchers/cancel/`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: {"voucher-id":voucherId}
    };
    try {
      axios.request(config)
        .then((response) => {router.reload()})
    } catch (error) {
      console.error(error);
    };
  };

  return (
    <Layout>
      <PageTitle>Administrative Income-Expense Tracker</PageTitle> 
      <div className="flex flex-col flex-wrap mb-8 space-y-4 md:flex-row md:items-end md:space-x-4">
  <Button iconRight={EditIcon} onClick={() => {
    setShowIncomeVoucher(true);
    setShowExpenseVoucher(false);
    openModal();
  }}>
    New Income Record
  </Button>
  <Button iconRight={EditIcon} onClick={() => {
        setShowIncomeVoucher(false);
        setShowExpenseVoucher(true);
    openModal();
  }}>
    New Expense Record
  </Button>
</div>

<Modal isOpen={isModalOpen} onClose={closeModal}>
  <ModalBody>
    {showIncomeVoucher && (
      <IncomeVoucherForm />
    )}
    {showExpenseVoucher && (
      <ExpenseVoucherForm />
    )}
  </ModalBody>
</Modal>
      <TableContainer>
        <Table>
          <TableHeader>

              <TableCell>Display Id</TableCell>
              <TableCell>Financial Year</TableCell>
              <TableCell style={{ textAlign: 'right' }}>Amount</TableCell>
              <TableCell>Head</TableCell>
              <TableCell>Sub Head</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell>Print</TableCell>
              <TableCell>Cancel</TableCell>
          </TableHeader>
          <TableBody>
  {voucherRecords.map((voucher, i) => (
    <TableRow key={i}>
      <TableCell ><div className="text-base font-sans">{voucher.voucher_display_id}</div></TableCell>
      <TableCell><div className="text-base font-sans">{voucher.voucher_financial_year}</div></TableCell>
      <TableCell style={{ textAlign: 'right' }} >{formatCurrencyAmount(voucher.voucher_amount)}</TableCell>
      <TableCell><div className="text-base font-sans">{voucher.voucher_head}</div></TableCell>
      <TableCell><div className="text-base font-sans">{voucher.voucher_subhead}</div></TableCell>
      <TableCell><div className="text-base font-sans"><span title={voucher.voucher_date}>
    {formatDate(voucher.voucher_date)}
  </span></div></TableCell>
      <TableCell>
      <Button onClick={() => alert(voucher.remarks)} layout="link" size="small" aria-label="View Remarks"> 
                        <ChatIcon className="w-5 h-5" aria-hidden="true" />
                    </Button>
      </TableCell>
      <TableCell>
      <Button
        onClick={() => {
          const url = `/service/voucher/print/${encodeURIComponent(voucher.voucher_display_id)}`;
          window.open(url, '_blank');
        }}
        layout="link"
        size="small"
        aria-label="Print View"
      >
        <FormsIcon className="w-5 h-5" aria-hidden="true" />
      </Button>
      </TableCell>
      <TableCell>
        <Button onClick={() => cancelVoucher(voucher.voucher_display_id)} layout="link" size="small" aria-label="Cancel Voucher">
        <TrashIcon className="w-5 h-5" aria-hidden="true" />

          </Button>
      </TableCell>
    </TableRow>
  ))}
</TableBody>
        </Table>
      </TableContainer>
    </Layout>
  );
}


export default IncomeExpense;
