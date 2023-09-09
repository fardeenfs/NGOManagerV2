import React, { useContext, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { Label, Input, Button, WindmillContext } from '@roketid/windmill-react-ui';
import { useAuth } from 'context/AuthContext';
import qs from 'qs';
import { useRouter } from 'next/router';

function LoginPage() {
  const router = useRouter();
  
  const { mode } = useContext(WindmillContext);
  const { setTokens } = useAuth();
  const imgSource = mode === 'dark' ? '/assets/img/login-office-dark.jpeg' : '/assets/img/login-office.jpeg';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const data = qs.stringify({
      'username': username,
      'password': password
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: process.env.NEXT_PUBLIC_BACKEND_URL+'/api/token/',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded', 
        Cookie: 'csrftoken=l24rtPIjD3MYL7l0vxw9FYjO4Ct8M3Mp'
      },
      data : data
    };
    try {
      const response = await axios.request(config);
      setTokens(response.data.access, response.data.refresh);
      router.push('/service/');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className='flex items-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900'>
      <div className='flex-1 h-full max-w-4xl mx-auto overflow-hidden bg-white rounded-lg shadow-xl dark:bg-gray-800'>
        <div className='flex flex-col overflow-y-auto md:flex-row'>
          <div className='relative h-32 md:h-auto md:w-1/2'>
            <Image
              aria-hidden='true'
              className='hidden object-cover w-full h-full'
              src={imgSource}
              alt='Office'
              layout='fill'
            />
          </div>
          <main className='flex items-center justify-center p-6 sm:p-12 md:w-1/2'>
            <div className='w-full'>
              <h1 className='mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200'>
                Login
              </h1>
              <Label>
                <span>Email</span>
                <Input
                  className='mt-1'
                  type='email'
                  placeholder='john@doe.com'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Label>

              <Label className='mt-4'>
                <span>Password</span>
                <Input
                  className='mt-1'
                  type='password'
                  placeholder='***************'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Label>

              <Link href='/service/' passHref={true}>
              <Button
                className='mt-4'
                block
                onClick={handleLogin}
              >
                Log in
              </Button>
              </Link>

              <hr className='my-8' />

              <p className='mt-4'>
                <Link href='/example/forgot-password'>
                  <a className='text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline'>
                    Forgot your password?
                  </a>
                </Link>
              </p>
              <p className='mt-1'>
                <Link href='/example/create-account'>
                  <a className='text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline'>
                    Create account
                  </a>
                </Link>
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default LoginPage
