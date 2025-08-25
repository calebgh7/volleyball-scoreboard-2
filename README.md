# 🏐 VolleyScore Pro

A professional volleyball scoreboard system with online hosting, user accounts, and persistent data storage.

## ✨ **Features**

### **🎯 Core Functionality**
- **Live Scoreboard** - Real-time score updates
- **Team Management** - Custom logos, colors, and names
- **Match Control** - Set management, score tracking
- **Overlay Mode** - Perfect for streaming and broadcasting

### **🌐 Online Features (NEW!)**
- **User Accounts** - Save your data and access from anywhere
- **Persistent Storage** - Teams, logos, and settings saved permanently
- **Cloud Image Storage** - Secure logo storage with Cloudinary
- **Multi-User Support** - Each user has their own data
- **Scoreboard Templates** - Save and reuse scoreboard setups

### **🎨 Customization**
- **Team Colors** - 8 preset schemes + custom hex colors
- **Custom Text Colors** - Perfect contrast for any background
- **Set Background Colors** - Glassy effects for set totals
- **Logo Upload** - Support for PNG, JPG, SVG files
- **Theme Presets** - Multiple visual themes

## 🚀 **Quick Start**

### **Local Development**
```bash
# Clone the repository
git clone <your-repo-url>
cd VolleyScoreStream

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### **Online Deployment**
See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

## 🏗️ **Architecture**

```
Frontend (React + TypeScript)
    ↓
Backend (Express + Node.js)
    ↓
Database (PostgreSQL)
    ↓
Cloud Storage (Cloudinary)
```

## 📱 **Usage**

### **1. Create Account**
- Register with email and password
- Your data is automatically saved and synced

### **2. Set Up Teams**
- Upload team logos (PNG, JPG, SVG)
- Choose preset color schemes or custom hex colors
- Set custom text colors for perfect contrast
- Configure set total background colors

### **3. Start Match**
- Select match format (Best of 3 or 5)
- Use +/- buttons to control scores and sets
- Complete sets automatically or manually
- Reset sets or entire matches as needed

### **4. Streaming Integration**
- Open overlay window for OBS/streaming software
- Transparent background for seamless integration
- Recommended size: 1920x1080
- Perfect for tournament broadcasts

## 🔧 **Technical Details**

### **Frontend**
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/ui** components
- **Wouter** for routing
- **React Query** for data management

### **Backend**
- **Express.js** server
- **Drizzle ORM** for database operations
- **JWT authentication**
- **Multer** for file uploads
- **Cloudinary** for image storage

### **Database**
- **PostgreSQL** with Drizzle ORM
- **User management** and data ownership
- **Automatic migrations**
- **Connection pooling**

### **Storage**
- **Cloudinary** for production image storage
- **Local storage** fallback for development
- **Automatic image optimization**
- **CDN delivery**

## 🌍 **Deployment Options**

### **Railway (Recommended)**
- Free tier with $5/month credit
- Automatic PostgreSQL database
- Easy deployment from GitHub
- Perfect for small to medium projects

### **Vercel + Supabase**
- Generous free tiers
- Excellent performance
- More complex setup
- Better for production apps

### **Netlify + Railway**
- Great free tiers
- Easy frontend deployment
- Backend on separate service
- Good for frontend-heavy apps

## 📊 **Database Schema**

### **Users**
- Account management and authentication
- Data ownership and privacy

### **Teams**
- Team information and logos
- Color schemes and customization
- User ownership

### **Matches**
- Match data and scoring
- Set history and completion status
- User ownership

### **Settings**
- User preferences and themes
- Sponsor logos and branding
- Display options

### **Templates**
- Saved scoreboard configurations
- Quick setup for tournaments
- Sharing capabilities

## 🔐 **Security Features**

- **JWT authentication** with secure tokens
- **Password hashing** with bcrypt
- **User session management**
- **Data isolation** between users
- **Secure file uploads**
- **Environment variable protection**

## 📈 **Performance Features**

- **Database connection pooling**
- **Image optimization** with Cloudinary
- **CDN delivery** for static assets
- **Lazy loading** for images
- **Efficient queries** with Drizzle ORM

## 🎯 **Use Cases**

### **Tournament Organizers**
- Set up multiple teams quickly
- Save tournament configurations
- Share scoreboards with participants
- Professional streaming integration

### **Schools & Clubs**
- Maintain team rosters
- Consistent branding across matches
- Easy setup for different teams
- Professional appearance

### **Streamers & Broadcasters**
- Clean overlay integration
- Custom branding options
- Professional scoreboard display
- Easy score management

### **Recreational Leagues**
- Simple team setup
- Persistent data storage
- Professional appearance
- Easy access from anywhere

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Database Connection Failed**
- Check environment variables
- Ensure database service is running
- Verify connection strings

#### **Image Upload Failed**
- Check Cloudinary credentials
- Verify file size and format
- Check network connectivity

#### **Authentication Errors**
- Verify JWT secret is set
- Check token expiration
- Ensure proper CORS settings

### **Development Issues**
- Use `npm run db:studio` to inspect database
- Check server logs for errors
- Verify environment variables
- Test with in-memory storage first

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

MIT License - see LICENSE file for details.

## 🆘 **Support**

- **Documentation**: Check this README and DEPLOYMENT.md
- **Issues**: Use GitHub Issues for bug reports
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact maintainers for urgent issues

## 🎉 **Roadmap**

### **Short Term**
- [ ] Password field in users table
- [ ] Enhanced authentication
- [ ] Team sharing features
- [ ] Tournament management

### **Medium Term**
- [ ] Mobile app
- [ ] Advanced statistics
- [ ] Multi-language support
- [ ] API documentation

### **Long Term**
- [ ] Real-time collaboration
- [ ] Advanced analytics
- [ ] Integration with sports APIs
- [ ] Professional features

---

**Made with ❤️ for the volleyball community**

Your scoreboard system is now ready for online hosting with full data persistence! Users can create accounts, save their team setups, and access their data from anywhere in the world. 🏐✨
