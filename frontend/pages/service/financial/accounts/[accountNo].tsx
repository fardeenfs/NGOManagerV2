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
  Label,
  Select,
  Input,
} from '@roketid/windmill-react-ui'
import { EditIcon, TrashIcon } from 'icons'
import axios from 'axios';
import { useRouter } from 'next/router';
import { useAuth } from 'context/AuthContext';
import Layout from 'example/containers/Layout';
import PageTitle from 'example/components/Typography/PageTitle';
import Link from 'next/link';

import { Tab } from '@chakra-ui/react';
import SectionTitle from 'example/components/Typography/SectionTitle';
import { useConfig } from 'context/ConfigContext';

interface Props {
  accounts: any[];
  txns: any[];
}


function AccountsInfo() {

    const { accessToken, loginLoading } = useAuth();
    const { currency, currencySymbol, setCurrency, timezone, setTimezone } = useConfig();
    const router = useRouter();
    
    const {accountNo} = router.query;

    const [txns, setTxns] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    
    const resultsPerPage = 10;


    function formatCurrencyAmount(amount: Number) {
      return Number(amount).toLocaleString('en-IN', {
        style: 'currency',
        currency: currency,});
    }
    
    function onPageChange(p) {
      setCurrentPage(p);
    }
  

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');

    const filteredData = txns.filter(txn => 
      Object.values(txn).some(value => 
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      ) &&
      (selectedType === '' || txn.type === selectedType)
  );
  const slicedData = filteredData.slice(
      (currentPage - 1) * resultsPerPage,
      currentPage * resultsPerPage
  );
  
  function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString(undefined, options);
    return formattedDate.split('/').join('-');
  }


    
    const [formData, setFormData] = useState({
        account_serial: '',
        account_name: '',
        account_number: '',
        bank_name: '',
        opening_balance: '',
        current_balance: '',
        cash_in_hand:'',
        cash_in_bank:'',
        voucher_income:'',
        voucher_expense:'',
        dues_income:''
    });

    useEffect(() => {
        if (accountNo && accessToken) {
          console.log(accountNo);
        const config = {
            method: 'get',
            url: process.env.NEXT_PUBLIC_BACKEND_URL+`/api/account-info/?account_serial=${accountNo}`,
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
        }
        console.log(config)

        axios.request(config)
        .then((response) => {
          setFormData({ ...response.data.accountInfo, ...response.data.breakdown });

        setTxns(response.data.txns);

        console.log(response.data);
        console.log(txns);
        })
        .catch((err) => console.error(err));
    }
    if (!loginLoading && !accessToken){
      router.push('/login/');
    }
    
    }, [accessToken,accountNo]);


    
    function AccountsInfoTableRow({ label, value }) {
      return (
          <TableRow>
              <TableCell className="font-bold">{label}</TableCell>
              <TableCell>{value}</TableCell>
          </TableRow>
      );
  }
    return (
        <Layout>
            <PageTitle>{formData.account_serial} Account Information</PageTitle>
            <div className="text-sm ">
            <div className="flex flex-col flex-wrap mb-8 space-y-8 md:flex-row md:space-x-4">

    <TableContainer>
        <Table>
            <TableBody>
                <AccountsInfoTableRow label="Account Serial" value={formData.account_serial} />
                <AccountsInfoTableRow label="Account Name" value={formData.account_name} />
                <AccountsInfoTableRow label="Account Number" value={formData.account_number} />
                <AccountsInfoTableRow label="Bank Name" value={formData.bank_name} />
                <AccountsInfoTableRow label="Opening Balance" value={formatCurrencyAmount(Number(formData.opening_balance))} />
                <AccountsInfoTableRow label="Current Balance" value={formatCurrencyAmount(Number(formData.current_balance))} />
                <AccountsInfoTableRow label="Cash in Hand" value={formatCurrencyAmount(Number(formData.cash_in_hand))} />
                <AccountsInfoTableRow label="Cash in Bank" value={formatCurrencyAmount(Number(formData.cash_in_bank))} />
                <AccountsInfoTableRow label="Voucher Income" value={formatCurrencyAmount(Number(formData.voucher_income))} />
                <AccountsInfoTableRow label="Voucher Expense" value={formatCurrencyAmount(Number(formData.voucher_expense))} />
                <AccountsInfoTableRow label="Dues Income" value={formatCurrencyAmount(Number(formData.dues_income))} />
            </TableBody>
        </Table>
    </TableContainer>
    </div>
    </div>

            <br/><br/>
          
            <SectionTitle>Account Transactions Ledger</SectionTitle>
      <div className="flex mb-4">
          <Input 
              className="mr-4 flex-grow" 
              placeholder="Search" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
          />
          <Select 
              value={selectedType} 
              onChange={e => setSelectedType(e.target.value)}>
              <option value=''>All Types</option>
              {/* Map through the unique types and create option elements */}
              {
                  [...new Set(txns.map(txn => txn.type))].map(type => (
                      <option key={type} value={type}>{type}</option>
                  ))
              }
          </Select>
      </div>
      <div className="text-sm font-base">
      <TableContainer>
        <Table>
          <TableHeader>
            <tr>
              <TableCell>Txn Id</TableCell>
              <TableCell>Financial Year</TableCell>
              <TableCell>Type</TableCell>
              <TableCell style={{ textAlign: 'right' }}>CH</TableCell>
              <TableCell style={{ textAlign: 'right' }}>CB</TableCell>
              <TableCell style={{ textAlign: 'right' }}>CRNTB</TableCell>
              <TableCell>Txn User</TableCell>
              <TableCell>Txn Date</TableCell>
              <TableCell>Txn Ref</TableCell>
              
            </tr>
          </TableHeader>
          <TableBody>
            {slicedData &&
              slicedData.map((txn, index) => (
                <TableRow key={index}>
                  <TableCell>{txn.txn_id}</TableCell>
                  <TableCell>{txn.financial_year}</TableCell>
                  <TableCell>{txn.type}</TableCell>
                  <TableCell style={{ textAlign: 'right' }}>{formatCurrencyAmount(txn.add_to_cash_in_hand)}</TableCell>
                  <TableCell style={{ textAlign: 'right' }}>{formatCurrencyAmount(txn.add_to_cash_in_bank)}</TableCell>
                  <TableCell style={{ textAlign: 'right' }}>{formatCurrencyAmount(txn.add_to_current_balance)}</TableCell>
                  <TableCell>{txn.login_user}</TableCell>
                  <TableCell>{formatDate(txn.txn_time)}</TableCell>
                  <TableCell>{txn.txn_ref_id}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      </div>
        <TableFooter>
        <Pagination
    totalResults={filteredData.length}
    resultsPerPage={resultsPerPage}
    onChange={onPageChange}
    label="Table navigation"
/>

        </TableFooter>
        </Layout>
    )
}
export default AccountsInfo