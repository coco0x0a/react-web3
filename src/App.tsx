import React, { useState, useEffect } from 'react';
import './App.css';
import { useMoralis } from "react-moralis";
import { useMoralisWeb3Api } from "react-moralis";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';

const getAddressTxt = (str: string, n = 6) => {
  if (str){
    return str.slice(0, n)+'...'+str.slice(str.length - n)
  }
  return "";
};

interface nftProps {
  name: string
  image: string
  source: string
}

function App() {

    const { authenticate, isAuthenticated, isAuthenticating, user, account, logout } = useMoralis();
    const Web3Api = useMoralisWeb3Api();
    const [nfts, setNfts] = useState<Array<nftProps>>([])

    const login = async () => {
      if (!isAuthenticated) {

        await authenticate({signingMessage: "Log in using Moralis" })
          .then(function (user) {
            console.log("logged in user:", user);
            console.log(user!.get("ethAddress"));
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    }

    const logOut = async () => {
      await logout();
      console.log("logged out");
    }

    useEffect(() => {
      const fetchNFTS = async () => {
        const polygonNFTs = await Web3Api.account.getNFTs({
          chain: "polygon",
          address: "0xe29eac84046b770f11bf29302f085318a7fedecd"
          //if you have nft address: user!.get("ethAddress")
        });
        if (polygonNFTs?.result) {
          var ntfs_array =[]
          for (let nft of polygonNFTs?.result) {
            var source = nft?.name
            console.log(nft)
            if (nft?.metadata) {
              const metadata = JSON.parse(nft?.metadata)
              var image = ''
              if (metadata?.image) image = metadata?.image
              if (metadata?.image_url) image = metadata?.image_url
              if (image.startsWith("ipfs://")) {
                image = image.replace("ipfs://", "https://ipfs.io/ipfs/")
              }
              ntfs_array.push({
                name: metadata?.name,
                image: image,
                source: source
              })
            }
          }
          setNfts(ntfs_array)
        }
      }
      if (isAuthenticated) {
        fetchNFTS()
      }
    }, [isAuthenticated]);

  return (
    <div>
        <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              My Dapp
            </Typography>
            <Typography>
              {user ? getAddressTxt(user!.get("ethAddress")) : ''}
            </Typography>
            {isAuthenticated === false ?
              <Button variant="contained" onClick={login}
              style={{"backgroundColor": "white", "color": "black"}}>
                Login
                </Button>
              :
              <Button variant="contained" onClick={logOut}
              style={{"backgroundColor": "white", "color": "black"}}>
                Logout
                </Button>
            }
          </Toolbar>
        </AppBar>
      </Box>
      <Container maxWidth="lg">
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <h1>My NFTs</h1>
          </Grid>
          <h3></h3>
          {nfts.map((row) => (
            <Grid xs={12} lg={6} item key={row.image}>
                  <Card>
          <CardMedia
            component="img"
            height="300"
            image={row.image}
            alt={row.name}
          />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {row.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {row.source}
                    </Typography>
                  </CardContent>
                  {/* <CardActions>
                    <Button size="small">Share</Button>
                    <Button size="small">Learn More</Button>
                  </CardActions> */}
                </Card>
            </Grid>
          ))}
          </Grid>
    </Box>
      </Container>
      

    </div>
  );
}

export default App;