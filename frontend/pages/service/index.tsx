import React, { useState, useEffect, useCallback, Key } from 'react'
import Link from 'next/link'
import { Doughnut, Line } from 'react-chartjs-2'

import axios, { AxiosResponse } from 'axios';
import { useAuth } from 'context/AuthContext';


import CTA from 'example/components/CTA'
import InfoCard from 'example/components/Cards/InfoCard'
import ChartCard from 'example/components/Chart/ChartCard'
import ChartLegend from 'example/components/Chart/ChartLegend'
import PageTitle from 'example/components/Typography/PageTitle'
import RoundIcon from 'example/components/RoundIcon'
import Layout from 'example/containers/Layout'
import response, { ITableData } from 'utils/demo/tableData'
import { ChatIcon, CartIcon, MoneyIcon, PeopleIcon, EditIcon } from 'icons'

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
  Button
} from '@roketid/windmill-react-ui'

import {
  doughnutOptions,
  lineOptions,
  doughnutLegends,
  lineLegends,
} from 'utils/demo/chartsData'

import {
  Chart,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { useConfig } from 'context/ConfigContext';
import { Tab } from '@chakra-ui/react';
import { useRouter } from 'next/router';

function Dashboard() {

    const { accessToken, loginLoading } = useAuth();
    const { currency, currencySymbol, setCurrency, timezone, setTimezone } = useConfig();
    const router = useRouter();
    
    const [memberSearch, setMemberSearch] = useState('');
    const [familySearch, setFamilySearch] = useState('');
    const [receiptSearch, setReceiptSearch] = useState('');
    const [response, setResponse] = useState<{[key: string]: any} | null>(null);
    const [homeData, setHomeData] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const resultsPerPage = 10;

    const slicedData = homeData.slice(
      (currentPage - 1) * resultsPerPage,
      currentPage * resultsPerPage
    );
    function onPageChange(p) {
      setCurrentPage(p);
    }
    function formatCurrencyAmount(amount: Number) {
      return Number(amount).toLocaleString('en-IN', {
        style: 'currency',
        currency: currency,});
    }

    const handleMemberSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMemberSearch(e.target.value);
        setFamilySearch('');
        setReceiptSearch('');
    };

    const handleFamilySearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFamilySearch(e.target.value);
        setMemberSearch('');
        setReceiptSearch('');
    };

    const handleReceiptSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setReceiptSearch(e.target.value);
        setMemberSearch('');
        setFamilySearch('');
    };
    

const handleSearch = async () => {
        const postData = new URLSearchParams();
        postData.append('ReceiptSearch', receiptSearch);
        postData.append('MemberSearch', memberSearch);
        postData.append('FamilySearch', familySearch);

        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            body: postData
        };

        try {
            const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL+'/api/', options);
            const data = await response.json();
            console.log(data);
            setResponse(data); 
        } catch (error) {
            console.error('Error:', error);
        };
    };

  useEffect(() => {
    if(accessToken) {
    const config = {
      method: 'get',
      url: process.env.NEXT_PUBLIC_BACKEND_URL+'/api/',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
  }
  console.log(config)

  axios.request(config)
  .then((response) => {
    console.log(response.data);
    setHomeData(response.data.members);

  })
}
if (!loginLoading && !accessToken) {
  router.push('/login/');
}
  }, [accessToken]);
  return (
    <Layout>
      <PageTitle>Dashboard</PageTitle>  
<div className="flex items-center justify-center p-6 sm:p-12 ">
            <div className="flex space-x-4 w-full">
                <Input
                    className='mt-1'
                    type='email'
                    placeholder='Member No./Name Search'
                    value={memberSearch}
                    onChange={handleMemberSearchChange}
                />
                <Input
                    className='mt-1'
                    type='email'
                    placeholder='Family No./Name Search'
                    value={familySearch}
                    onChange={handleFamilySearchChange}
                />
                <Input
                    className='mt-1'
                    type='email'
                    placeholder='Receipt No. Search'
                    value={receiptSearch}
                    onChange={handleReceiptSearchChange}
                />
                <Button onClick={handleSearch}>
                    Search
                </Button>
            </div>
        </div>

  
<div className="flex flex-col space-y-6">
  {homeData && !response && 
      <TableContainer>
          <Table>
              <TableHeader>
                    <TableCell style={{textAlign:'right'}}>Member No.</TableCell>
                    <TableCell>Member Name</TableCell>
                    <TableCell style={{textAlign:'right'}}>Family No.</TableCell>
                    <TableCell>Family Name</TableCell>
                    <TableCell style={{textAlign:'right'}}>Age</TableCell>
                    <TableCell>Area</TableCell>
                    <TableCell>Actions</TableCell>
              </TableHeader>
              <TableBody>
              {slicedData &&
                slicedData.map((row, index) => 
                      <TableRow>
                        <TableCell style={{textAlign:'right'}}>{row.jp_number}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell style={{textAlign:'right'}}>{row.family_number}</TableCell>
                        <TableCell>{row.house_name}</TableCell>
                        <TableCell style={{textAlign:'right'}}>{row.age}</TableCell>
                        <TableCell>{row.area}</TableCell>
                        
                          <TableCell>
                    <div className="flex items-center space-x-4">
                      <Button layout="link" size="small" aria-label="Edit" >
                      <Link href={`/service/membership/edit/${row.jp_number}`}> 
                        <EditIcon className="w-5 h-5" aria-hidden="true" />
                        </Link>
                      </Button>
                      <Button layout="link" size="small" aria-label="View Family">
                        <Link href={`/service/family/${row.family_number}`}> 
                          <PeopleIcon className="w-5 h-5" aria-hidden="true" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                      </TableRow>
                  )}
              </TableBody>
          </Table>
          <TableFooter>
              <Pagination
                totalResults={homeData.length}
                resultsPerPage={resultsPerPage}
                onChange={onPageChange}
                label="Table navigation"
              />
            </TableFooter>
      </TableContainer>
      
                }

  {/* Check if 'rows' key is present in response - indicating a MemberSearch response */}
    {response && response.rows && 
    <TableContainer>
        <Table>
            <TableHeader>
                    <TableCell style={{textAlign:'right'}}>Member No.</TableCell>
                    <TableCell>Member Name</TableCell>
                    <TableCell style={{textAlign:'right'}}>Family No.</TableCell>
                    <TableCell style={{textAlign:'right'}}>Outstanding Balance</TableCell>
                    <TableCell>Actions</TableCell>
            </TableHeader>
            <TableBody>
                {response.rows.map((row: any, i: any) => 
                    <TableRow key={i}>
                            <TableCell style={{textAlign:'right'}}>{row[0]}</TableCell>
                          <TableCell>{row[1]}</TableCell>
                          <TableCell style={{textAlign:'right'}}>{row[2]}</TableCell>
                          <TableCell style={{textAlign:'right'}}>{formatCurrencyAmount(row[3])}</TableCell>
                        
                        <TableCell>
                  <div className="flex items-center space-x-4">
                    <Button layout="link" size="small" aria-label="Edit" >
                    <Link href={`/service/membership/edit/${row[0]}`}> 
                      <EditIcon className="w-5 h-5" aria-hidden="true" />
                      </Link>
                    </Button>
                    <Button layout="link" size="small" aria-label="View Family">
                    <Link href={`/service/family/${row[2]}`}> 
                        <PeopleIcon className="w-5 h-5" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
                    </TableRow>
                )}
            </TableBody>

        </Table>
    </TableContainer>
    }

  
      {/* Check if 'xrows' key is present in response - indicating a FamilySearch response */}
      {response && response.xrows && Object.keys(response.xrows).map((key, i) => (
        <TableContainer>
        <Table>
          <TableHeader>
       
        {response && response.header.map((head: String, i:Key) => (
          <TableCell key={i}>{head}</TableCell>
        ))}
        <TableCell>
          <Link href={`/service/family/${response.xrows[key][0][2]}`}> 
                <a className="text-purple-600 hover:underline">View Family Details -</a>
              </Link>
        </TableCell>
      
    </TableHeader>
    <TableBody>
          {response.xrows[key].map((row: any, j: any) => (
            <TableRow key={`${i}-${j}`}>
              {row.map((cell: any, k: any) => (
                <TableCell>{cell}</TableCell>
              ))}
            <TableCell>
              <Link href={`/service/membership/edit/${row[0]}`}> 
                <a className="text-purple-600 hover:underline">Edit Member</a>
              </Link>
            </TableCell>
            </TableRow>
          ))}
          </TableBody>
        </Table>
        </TableContainer>
        
      ))}
  
      </div>

</Layout>
  )
}

export default Dashboard
