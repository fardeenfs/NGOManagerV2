import React, { useEffect, useState } from 'react'

import {
  Table,
  TableHeader,
  TableCell,
  TableBody,
  TableRow,
  TableFooter,
  TableContainer,
  Badge,
  Avatar,
  Button,
  Pagination,
  Modal,
  ModalBody,
} from '@roketid/windmill-react-ui'
import { EditIcon, TrashIcon } from 'icons'
import axios from 'axios';
import { useRouter } from 'next/router';
import { useAuth } from 'context/AuthContext';
import Layout from 'example/containers/Layout';
import PageTitle from 'example/components/Typography/PageTitle';
import { formatWithValidation } from 'next/dist/shared/lib/utils';
import DepositWithdrawalForm from 'example/components/Accounts/DepositWithdrawalForm';
import TransferForm from 'example/components/Accounts/TransferForm';
import { useConfig } from 'context/ConfigContext';

function ManualTransactions() {
  const { accessToken, loginLoading } = useAuth();
  const { currency, currencySymbol, setCurrency, timezone, setTimezone } = useConfig();
  const router = useRouter();


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

  const [txns, setTxns] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const resultsPerPage = 10;


  const [isModalOpen, setIsModalOpen] = useState(false)

  const [showDepositWithdrawal, setShowDepositWithdrawal] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

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
      url: process.env.NEXT_PUBLIC_BACKEND_URL+'/api/manual-transactions/',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
    axios
      .request(config)
      .then((response) => {
        console.log(response.data);
        setTxns(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
    };
    if (!loginLoading && !accessToken){
      router.push('/login/');
    }
  }, [accessToken]);

  function onPageChange(p) {
    setCurrentPage(p);
  }

  const slicedData = txns.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  return (
    <Layout>
      <PageTitle>Transactions</PageTitle>
      <div className="flex flex-col flex-wrap mb-8 space-y-4 md:flex-row md:items-end md:space-x-4">
  <Button iconRight={EditIcon} onClick={() => {
    setShowDepositWithdrawal(true);
    setShowTransfer(false);
    openModal();}}>
    New Deposit/Withdrawal
  </Button>
  <Button iconRight={EditIcon} onClick={() => {
        setShowDepositWithdrawal(false);
        setShowTransfer(true);
        openModal();}}>
    New Transfer
  </Button>
</div>
      <div id="transactions">
      <Modal isOpen={isModalOpen} onClose={closeModal}>
  <ModalBody>
    {showDepositWithdrawal && <DepositWithdrawalForm />}
    {showTransfer && <TransferForm />}
  </ModalBody>
</Modal>
<div className="text-sm font-sans">
        <TableContainer>
          <Table>
            <TableHeader>
              <tr>
                <TableCell>Transaction Id</TableCell>
                <TableCell>Account Serial</TableCell>
                <TableCell>Account Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell style={{ textAlign: 'right' }}>Amount</TableCell>
                <TableCell>Txn User</TableCell>
                <TableCell>Txn Date</TableCell>
              </tr>
            </TableHeader>
            <TableBody>
              {slicedData &&
                slicedData.map((val, index) => (
                  <TableRow key={index}>
                    <TableCell>{val[0]}</TableCell>
                    <TableCell>{val[1]}</TableCell>
                    <TableCell>{val[2]}</TableCell>
                    <TableCell>{val[4]}</TableCell>
                    <TableCell style={{ textAlign: 'right' }}>{formatCurrencyAmount(val[5])}</TableCell>
                    <TableCell>{val[6]}</TableCell>
                    <TableCell title={val[7]}>{formatDate(val[7])}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        </div>
        <TableFooter>
          <Pagination
            totalResults={txns.length}
            resultsPerPage={resultsPerPage}
            onChange={onPageChange}
            label="Table navigation"
          />
        </TableFooter>
      </div>
    </Layout>
  );
}

export default ManualTransactions;