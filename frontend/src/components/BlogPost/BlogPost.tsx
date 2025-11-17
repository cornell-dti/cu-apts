import React, { ReactElement, useState, useEffect } from 'react';
import axios from 'axios';
import { getUser, createAuthHeaders } from '../../utils/firebase';
import { Box, Button } from '@material-ui/core';
