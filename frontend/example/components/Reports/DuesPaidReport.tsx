import React, { useState } from 'react';
import {
    Table,
    TableCell,
    TableRow,
    Input,
    Button,
    Label,
    TableHeader
} from '@roketid/windmill-react-ui';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useAuth } from 'context/AuthContext';

const DuesPaidReport = () => {
    const { accessToken } = useAuth();
    const router = useRouter();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSubmit = (e: React.FormEvent, reportType: string) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("btn", reportType);
        formData.append("start-date", startDate);
        formData.append("end-date", endDate);

        const config = {
            method: 'post',
            url: process.env.NEXT_PUBLIC_BACKEND_URL+'/api/reports/dues-paid/',
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
            link.setAttribute("download", `DuesPaidReport.xlsx`);
            document.body.appendChild(link);
            link.click();
        });
    };
    

    return (
        <form onSubmit={(e) => handleSubmit(e, 'yearly')}> 
            <Table>
                <TableHeader>
                    <TableCell>
                        Generate Annual Report
                    </TableCell>
                </TableHeader>
                <TableRow>
                    <TableCell>
                        <Button onClick={(e) => handleSubmit(e, 'yearly')}>Annual Report</Button>
                    </TableCell>
                </TableRow>
                <TableHeader>
                    <TableCell>
                        Generate Custom Report
                    </TableCell>
                </TableHeader>
                <TableRow>
                    <TableCell>
                        <Label>
                            Start Date
                            <Input 
                                type="date" 
                                name="startdate" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </Label>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        <Label>
                            End Date
                            <Input 
                                type="date" 
                                name="enddate" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </Label>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        <Button onClick={(e) => handleSubmit(e, 'monthly')}>Custom Report</Button>
                    </TableCell>
                </TableRow>
            </Table>
        </form>
    );
};

export default DuesPaidReport;