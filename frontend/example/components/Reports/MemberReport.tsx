import React, { useState } from 'react';
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

const MemberReport = () => {
    const { accessToken } = useAuth();
    const router = useRouter();
  

  const [rtype, setRtype] = useState("MembersList");
  const [rfilter, setRfilter] = useState("All");
  const [rward, setRward] = useState("All");

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("report-type", rtype);
    formData.append("filter-type", rfilter);
    formData.append("ward-type", rward);

    const config = {
        method: 'post',
        url: process.env.NEXT_PUBLIC_BACKEND_URL+'/api/reports/',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        data: formData,
        responseType: 'blob'  // <-- This is important
    };
      
    axios.request(config)
    .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `MembersReport ${rtype}-${rfilter}-${rward}.xlsx`);
        document.body.appendChild(link);
        link.click();
    });
  };

  return (

    <>
    <SectionTitle>Generate A Member Report</SectionTitle>
      <Label>
        <span>Select Report Type <span>*</span></span>
        <Select
          className="mt-1"
          value={rtype}
          onChange={(e) => setRtype(e.target.value)}
        >
          <option value="MembersList">Members List (With Dependants)</option>
          <option value="MembersListNoD">Members List (Without Dependants)</option>
          <option value="FamilyList">Family List</option>
        </Select>
      </Label>

      <Label className="mt-4">
        <span>Select Filter Type <span>*</span></span>
        <Select
          className="mt-1"
          value={rfilter}
          onChange={(e) => setRfilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Nri">NRI Members</option>
          <option value="Employee">Employee Members</option>
          <option value="Pension">Pension Members</option>
        </Select>
      </Label>

      <Label className="mt-4">
        <span>Select Ward <span>*</span></span>
        <Select
          className="mt-1"
          value={rward}
          onChange={(e) => setRward(e.target.value)}
        >
          <option value="All">All</option>
          <option value="North Edmonton">North Edmonton</option>
          <option value="East Edmonton">East Edmonton</option>
          <option value="West Edmonton">West Edmonton</option>
          <option value="South Edmonton">South Edmonton</option>
        </Select>
      </Label>

      <Button className="mt-4" onClick={handleSubmit}>
        Download
      </Button>
    </>
  );
};

export default MemberReport;
